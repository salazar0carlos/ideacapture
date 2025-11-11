import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
  isValidUUID,
} from '@/lib/api-helpers';
import { ValidationResult } from '@/lib/types';
import { Database } from '@/lib/database.types';
import { checkSubscriptionLimits } from '@/lib/subscription-helpers';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/ideas/[id]/validate - Validate idea using Claude
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

    // Check if user has access to validation feature
    const limits = await checkSubscriptionLimits(supabase, user.id);
    if (!limits.can_use_validation) {
      return NextResponse.json(
        formatApiResponse(null, 'Validation is only available for Pro users. Upgrade to access AI-powered idea validation.'),
        { status: 403, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Fetch idea from database
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
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

    // Check if validation already exists (unless force_revalidation is requested)
    const body = await request.json().catch(() => ({}));
    const forceRevalidation = body.force_revalidation === true;

    if (!forceRevalidation && idea.validation_result && idea.demand_score !== null) {
      return NextResponse.json(
        formatApiResponse(idea.validation_result, null),
        { status: 200, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Prepare refinement context
    const refinementContext = idea.refinement_answers
      ? Object.entries(idea.refinement_answers)
          .map(([key, value]) => {
            const question: any = Array.isArray(idea.refinement_questions)
              ? idea.refinement_questions.find((q: any) => q.id === key)
              : null;
            return question ? `Q: ${question.question}\nA: ${value}` : null;
          })
          .filter(Boolean)
          .join('\n\n')
      : '';

    // Prepare prompt for Claude
    const prompt = `You are an expert business analyst and market researcher. Analyze the following idea and provide a comprehensive validation assessment.

Idea Details:
- Title: ${idea.title}
- Type: ${idea.idea_type}
- Description: ${idea.description || 'No description provided'}

${refinementContext ? `Additional Context from Refinement:\n${refinementContext}` : ''}

Conduct a thorough analysis covering:

1. **Market Demand** (0-100 score)
   - Research potential market size and target audience
   - Identify demand signals (search trends, existing alternatives, pain points)
   - Consider the idea type (${idea.idea_type}) in your analysis
   - Look for evidence of people actively seeking solutions

2. **Competition Level** (0-100 score)
   - Identify key competitors and similar solutions
   - Assess market saturation
   - Evaluate barriers to entry
   - Consider competitive advantages or unique positioning

3. **Feasibility** (0-100 score)
   - Evaluate technical/implementation complexity
   - Consider required resources (time, money, skills)
   - Identify potential challenges and risks
   - Assess realistic timeline and effort

4. **Overall Recommendation**
   - Should this idea be pursued?
   - Clear reasoning based on the analysis
   - Specific, actionable next steps

Scoring Guide:
- 0-40: Poor (significant concerns, not recommended)
- 41-70: Medium (has potential but requires careful consideration)
- 71-100: Good (strong opportunity, recommended to pursue)

Return your analysis as a JSON object with this EXACT structure (no markdown, no code blocks, just valid JSON):

{
  "overall_score": 75,
  "demand": {
    "score": 80,
    "analysis": "Detailed analysis of market demand...",
    "signals": ["Signal 1", "Signal 2", "Signal 3"]
  },
  "competition": {
    "score": 60,
    "analysis": "Detailed analysis of competition...",
    "competitors": ["Competitor 1", "Competitor 2", "Competitor 3"]
  },
  "feasibility": {
    "score": 70,
    "analysis": "Detailed analysis of feasibility...",
    "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"]
  },
  "recommendation": {
    "should_pursue": true,
    "reasoning": "Clear, concise reasoning...",
    "next_steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
  }
}

Be specific, actionable, and honest in your assessment. Consider the idea type when analyzing.`;

    try {
      // Call Claude API for validation
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.7,
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

      // Clean up the response text (remove markdown code blocks if present)
      let cleanedText = content.text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      let validationResult: ValidationResult;
      try {
        const parsedResult = JSON.parse(cleanedText);

        // Add timestamp
        validationResult = {
          ...parsedResult,
          generated_at: new Date().toISOString(),
        };

        // Validate structure
        if (
          typeof validationResult.overall_score !== 'number' ||
          !validationResult.demand ||
          !validationResult.competition ||
          !validationResult.feasibility ||
          !validationResult.recommendation
        ) {
          throw new Error('Invalid validation result structure');
        }
      } catch (parseError) {
        console.error('Failed to parse Claude response:', cleanedText);

        // Create fallback partial result
        validationResult = {
          overall_score: 50,
          demand: {
            score: 50,
            analysis: 'Unable to complete full analysis. Please try again.',
            signals: ['Analysis incomplete'],
          },
          competition: {
            score: 50,
            analysis: 'Unable to complete full analysis. Please try again.',
            competitors: ['Analysis incomplete'],
          },
          feasibility: {
            score: 50,
            analysis: 'Unable to complete full analysis. Please try again.',
            challenges: ['Analysis incomplete'],
          },
          recommendation: {
            should_pursue: false,
            reasoning: 'Analysis could not be completed. Please try validating again.',
            next_steps: ['Try validation again'],
          },
          generated_at: new Date().toISOString(),
        };
      }

      // Update idea with validation results
      const { data: updatedIdea, error: updateError } = await (supabase as any)
        .from('ideas')
        .update({
          validation_result: validationResult as any,
          demand_score: validationResult.demand.score,
          competition_score: validationResult.competition.score,
          feasibility_score: validationResult.feasibility.score,
          is_worth_pursuing: validationResult.recommendation.should_pursue,
          status: 'validated',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Database update error:', updateError);
        // Return validation result even if DB update fails
        return NextResponse.json(
          formatApiResponse(validationResult, 'Validation completed but failed to save to database'),
          { status: 200, headers: addCorsHeaders(new Headers()) }
        );
      }

      return NextResponse.json(
        formatApiResponse(validationResult, null),
        { status: 200, headers: addCorsHeaders(new Headers()) }
      );
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);

      // Create minimal fallback result
      const fallbackResult: ValidationResult = {
        overall_score: 0,
        demand: {
          score: 0,
          analysis: 'AI validation service is currently unavailable.',
          signals: ['Service unavailable'],
        },
        competition: {
          score: 0,
          analysis: 'AI validation service is currently unavailable.',
          competitors: ['Service unavailable'],
        },
        feasibility: {
          score: 0,
          analysis: 'AI validation service is currently unavailable.',
          challenges: ['Service unavailable'],
        },
        recommendation: {
          should_pursue: false,
          reasoning: 'Unable to analyze due to service unavailability.',
          next_steps: ['Try again later'],
        },
        generated_at: new Date().toISOString(),
      };

      // Try to save fallback result
      await (supabase as any)
        .from('ideas')
        .update({
          validation_result: fallbackResult as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      return NextResponse.json(
        formatApiResponse(null, 'Failed to generate validation with AI'),
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

// OPTIONS /api/ideas/[id]/validate - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
