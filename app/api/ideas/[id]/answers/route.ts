import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
  isValidUUID,
} from '@/lib/api-helpers';
import { Database } from '@/lib/database.types';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/ideas/[id]/answers - Submit refinement answers and get refined description
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;

    // Authenticate user
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json(
        formatApiResponse(null, authError || 'Unauthorized'),
        { status: 401, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        formatApiResponse(null, 'Invalid idea ID format'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        formatApiResponse(null, 'Invalid JSON in request body'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    if (!body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) {
      return NextResponse.json(
        formatApiResponse(null, 'Answers must be provided as an object'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    const answers = body.answers as Record<string, string>;

    // Validate that we have at least some answers
    if (Object.keys(answers).length === 0) {
      return NextResponse.json(
        formatApiResponse(null, 'At least one answer must be provided'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Fetch idea from database - RLS policies automatically filter by user_id
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single() as { data: Database['public']['Tables']['ideas']['Row'] | null; error: any };

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          formatApiResponse(null, 'Idea not found'),
          { status: 404, headers: addCorsHeaders(new Headers()) }
        );
      }
      console.error('Database error:', fetchError);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to fetch idea'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    if (!idea) {
      return NextResponse.json(
        formatApiResponse(null, 'Idea not found'),
        { status: 404, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Validate that questions exist
    if (!idea.refinement_questions || !Array.isArray(idea.refinement_questions)) {
      return NextResponse.json(
        formatApiResponse(null, 'No refinement questions found. Generate questions first.'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Build Q&A text for Claude prompt
    const qaText = idea.refinement_questions
      .map((q: any, index: number) => {
        const answer = answers[q.id] || 'Not answered';
        return `Q${index + 1}: ${q.question}\nA${index + 1}: ${answer}`;
      })
      .join('\n\n');

    // Prepare prompt for Claude to generate refined description
    const prompt = `You are helping refine a user's idea based on their answers to refinement questions. Your task is to generate an improved, comprehensive description of their idea.

Original Idea:
- Title: ${idea.title}
- Type: ${idea.idea_type}
- Original Description: ${idea.description || 'No description provided'}

User's Answers to Refinement Questions:
${qaText}

Based on the original idea and the user's answers, write a clear, comprehensive, and well-structured description of the idea. The refined description should:
1. Maintain the original intent and core concept
2. Incorporate insights from the user's answers
3. Be clear and actionable
4. Be 2-4 paragraphs long
5. Cover the problem, solution, target audience, and key benefits
6. Sound professional yet approachable

Return ONLY the refined description text with no additional commentary or formatting markers.`;

    try {
      // Call Claude API to generate refined description
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract refined description
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const refinedDescription = content.text.trim();

      // Update idea with answers, refined description, and mark as complete
      // RLS policies automatically filter by user_id
      const { data: updatedIdea, error: updateError } = await (supabase as any)
        .from('ideas')
        .update({
          refinement_answers: answers as any,
          description: refinedDescription,
          refinement_complete: true,
          status: 'validated',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Database update error:', updateError);
        return NextResponse.json(
          formatApiResponse(null, 'Failed to save refined idea'),
          { status: 500, headers: addCorsHeaders(new Headers()) }
        );
      }

      return NextResponse.json(
        formatApiResponse(
          {
            idea: updatedIdea,
            refined_description: refinedDescription,
          },
          null
        ),
        { status: 200, headers: addCorsHeaders(new Headers()) }
      );
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to generate refined description with AI'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      formatApiResponse(null, 'Internal server error'),
      { status: 500, headers: addCorsHeaders(new Headers()) }
    );
  }
}

// OPTIONS /api/ideas/[id]/answers - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
