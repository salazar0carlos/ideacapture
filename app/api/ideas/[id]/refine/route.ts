import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
  isValidUUID,
} from '@/lib/api-helpers';
import { RefinementQuestion } from '@/lib/types';
import { Database } from '@/lib/database.types';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/ideas/[id]/refine - Generate refinement questions using Claude
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

    // Check if questions already exist
    if (idea.refinement_questions && Array.isArray(idea.refinement_questions) && idea.refinement_questions.length > 0) {
      return NextResponse.json(
        formatApiResponse(idea.refinement_questions, null),
        { status: 200, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Prepare prompt for Claude
    const prompt = `You are helping refine a user's idea. Analyze the following idea and generate exactly 5 thoughtful questions that will help the user think deeper about their idea and develop it further.

Idea Details:
- Title: ${idea.title}
- Type: ${idea.idea_type}
- Description: ${idea.description || 'No description provided yet'}

Generate 5 questions that cover different aspects:
1. Problem/Need (category: "problem") - What problem does this solve? Who experiences this problem?
2. Solution (category: "solution") - How will this work? What makes it unique?
3. Market (category: "market") - Who is the target audience? What's the market opportunity?
4. Feasibility (category: "feasibility") - What resources are needed? What are the challenges?
5. Other (category: "other") - Any other important considerations?

Return ONLY a valid JSON array with no additional text, in this exact format:
[
  {
    "id": "q1",
    "question": "The question text here?",
    "category": "problem",
    "required": true
  },
  {
    "id": "q2",
    "question": "Another question?",
    "category": "solution",
    "required": true
  }
]`;

    try {
      // Call Claude API
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract and parse response
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      let questions: RefinementQuestion[];
      try {
        questions = JSON.parse(content.text);
      } catch (parseError) {
        console.error('Failed to parse Claude response:', content.text);
        throw new Error('Failed to parse questions from Claude response');
      }

      // Validate questions structure
      if (!Array.isArray(questions) || questions.length !== 5) {
        throw new Error('Invalid questions format from Claude');
      }

      // Update idea with generated questions and set status to refining
      // RLS policies automatically filter by user_id
      const { data: updatedIdea, error: updateError } = await (supabase as any)
        .from('ideas')
        .update({
          refinement_questions: questions as any,
          status: 'refining',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Database update error:', updateError);
        return NextResponse.json(
          formatApiResponse(null, 'Failed to save questions'),
          { status: 500, headers: addCorsHeaders(new Headers()) }
        );
      }

      return NextResponse.json(
        formatApiResponse(questions, null),
        { status: 200, headers: addCorsHeaders(new Headers()) }
      );
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to generate questions with AI'),
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

// OPTIONS /api/ideas/[id]/refine - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
