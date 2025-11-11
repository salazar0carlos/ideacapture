import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
} from '@/lib/api-helpers';
import { Database } from '@/lib/database.types';

// GET /api/tasks - Fetch all tasks for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json(
        formatApiResponse(null, authError || 'Unauthorized'),
        { status: 401, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const projectId = url.searchParams.get('project_id');
    const ideaId = url.searchParams.get('idea_id');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Build query - RLS policies automatically filter by user_id
    let query = supabase
      .from('tasks')
      .select('*, projects(name), ideas(title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (projectId) query = query.eq('project_id', projectId);
    if (ideaId) query = query.eq('idea_id', ideaId);
    if (status && ['todo', 'in_progress', 'blocked', 'done', 'cancelled'].includes(status)) {
      query = query.eq('status', status);
    }
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      query = query.eq('priority', priority);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to fetch tasks'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Return response with pagination metadata
    return NextResponse.json(
      formatApiResponse(data, null, {
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: count ? offset + limit < count : false,
        },
      }),
      { status: 200, headers: addCorsHeaders(new Headers()) }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      formatApiResponse(null, 'Internal server error'),
      { status: 500, headers: addCorsHeaders(new Headers()) }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json(
        formatApiResponse(null, authError || 'Unauthorized'),
        { status: 401, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        formatApiResponse(null, 'Invalid JSON in request body'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Validate required fields
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        formatApiResponse(null, 'Task title is required'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Insert new task
    const { data, error } = await (supabase as any)
      .from('tasks')
      .insert({
        user_id: user.id,
        project_id: body.project_id || null,
        idea_id: body.idea_id || null,
        parent_task_id: body.parent_task_id || null,
        title: body.title,
        description: body.description || null,
        task_type: body.task_type || null,
        status: body.status || 'todo',
        priority: body.priority || 'medium',
        assigned_to: body.assigned_to || null,
        due_date: body.due_date || null,
        estimated_hours: body.estimated_hours || null,
        blockers: body.blockers || null,
      } as Database['public']['Tables']['tasks']['Insert'])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to create task'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Return created task
    return NextResponse.json(
      formatApiResponse(data, null),
      { status: 201, headers: addCorsHeaders(new Headers()) }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      formatApiResponse(null, 'Internal server error'),
      { status: 500, headers: addCorsHeaders(new Headers()) }
    );
  }
}

// OPTIONS /api/tasks - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
