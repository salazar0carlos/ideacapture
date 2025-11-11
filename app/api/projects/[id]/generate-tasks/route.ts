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

interface GeneratedTask {
  title: string;
  description: string;
  task_type: 'research' | 'design' | 'development' | 'testing' | 'marketing' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours: number;
  phase: string;
}

// POST /api/projects/[id]/generate-tasks - AI generates task breakdown
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
        formatApiResponse(null, 'Invalid project ID format'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Fetch project with associated idea
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*, ideas(*)')
      .eq('id', id)
      .single() as {
        data: Database['public']['Tables']['projects']['Row'] & {
          ideas: Database['public']['Tables']['ideas']['Row'] | null
        } | null;
        error: any
      };

    if (fetchError || !project) {
      return NextResponse.json(
        formatApiResponse(null, 'Project not found'),
        { status: 404, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Build context from idea if available
    const ideaContext = project.ideas ? `
Original Idea:
- Title: ${project.ideas.title}
- Type: ${project.ideas.idea_type}
- Description: ${project.ideas.description || 'Not provided'}
- Validation Scores:
  * Demand: ${project.ideas.demand_score || 'N/A'}/100
  * Competition: ${project.ideas.competition_score || 'N/A'}/100
  * Feasibility: ${project.ideas.feasibility_score || 'N/A'}/100
${project.ideas.validation_result ? `
- Recommended Next Steps:
${(project.ideas.validation_result as any)?.recommendation?.next_steps?.join('\n  ') || 'Not available'}
` : ''}
` : '';

    // Prepare prompt for Claude
    const prompt = `You are a project planning expert. Break down this project into a comprehensive, actionable task list.

Project: ${project.name}
${project.description ? `Description: ${project.description}` : ''}
${ideaContext}

Create a detailed task breakdown covering these phases:

**Phase 1: Research & Planning**
- Market research, user interviews, competitor analysis
- Define MVP scope, features, and success metrics
- Choose tech stack and architecture

**Phase 2: Design**
- User experience (UX) flows and wireframes
- User interface (UI) design and mockups
- Design system and component library

**Phase 3: Development**
- Set up project infrastructure
- Build core features
- Implement authentication, database, APIs
- Testing and debugging

**Phase 4: Launch & Marketing**
- Deployment setup
- User acquisition strategy
- Analytics and monitoring
- Documentation

For each task, provide:
- **title**: Clear, actionable task name (e.g., "Interview 10 target users")
- **description**: Specific details about what needs to be done
- **task_type**: One of: research, design, development, testing, marketing, other
- **priority**: One of: low, medium, high, urgent
- **estimated_hours**: Realistic time estimate (0.5 to 40 hours)
- **phase**: Which phase this belongs to

Aim for 20-30 tasks total. Be specific and actionable. Consider the project's feasibility score when estimating time.

Return ONLY a valid JSON array with no additional text:

[
  {
    "title": "Define target user personas",
    "description": "Research and document 3-5 detailed user personas including demographics, pain points, and goals",
    "task_type": "research",
    "priority": "high",
    "estimated_hours": 4,
    "phase": "Research & Planning"
  },
  {
    "title": "Create initial wireframes",
    "description": "Sketch lo-fi wireframes for core user flows (signup, main dashboard, key actions)",
    "task_type": "design",
    "priority": "medium",
    "estimated_hours": 8,
    "phase": "Design"
  }
]`;

    try {
      // Call Claude API
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
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

      // Clean up response (remove markdown code blocks if present)
      let cleanedText = content.text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      let generatedTasks: GeneratedTask[];
      try {
        generatedTasks = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse Claude response:', cleanedText);
        throw new Error('Failed to parse tasks from Claude response');
      }

      // Validate tasks structure
      if (!Array.isArray(generatedTasks) || generatedTasks.length === 0) {
        throw new Error('Invalid tasks format from Claude');
      }

      // Insert tasks into database
      const tasksToInsert: Database['public']['Tables']['tasks']['Insert'][] = generatedTasks.map((task, index) => ({
        user_id: user.id,
        project_id: id,
        idea_id: project.idea_id,
        title: task.title,
        description: task.description,
        task_type: task.task_type,
        priority: task.priority,
        estimated_hours: task.estimated_hours,
        status: 'todo' as const,
      }));

      const { data: insertedTasks, error: insertError } = await (supabase as any)
        .from('tasks')
        .insert(tasksToInsert)
        .select();

      if (insertError) {
        console.error('Database insert error:', insertError);
        return NextResponse.json(
          formatApiResponse(null, 'Failed to save generated tasks'),
          { status: 500, headers: addCorsHeaders(new Headers()) }
        );
      }

      return NextResponse.json(
        formatApiResponse(
          {
            tasks: insertedTasks,
            count: insertedTasks?.length || 0,
          },
          null
        ),
        { status: 200, headers: addCorsHeaders(new Headers()) }
      );
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to generate tasks with AI'),
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

// OPTIONS /api/projects/[id]/generate-tasks - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
