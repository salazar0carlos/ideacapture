import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
  isValidUUID,
} from '@/lib/api-helpers';
import { Database } from '@/lib/database.types';

// GET /api/tasks/[id] - Get single task
export async function GET(
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
        formatApiResponse(null, 'Invalid task ID format'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Fetch task - RLS automatically filters by user_id
    const { data, error } = await supabase
      .from('tasks')
      .select('*, projects(name), ideas(title)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          formatApiResponse(null, 'Task not found'),
          { status: 404, headers: addCorsHeaders(new Headers()) }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to fetch task'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    return NextResponse.json(
      formatApiResponse(data, null),
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

// PATCH /api/tasks/[id] - Update task
export async function PATCH(
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
        formatApiResponse(null, 'Invalid task ID format'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
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

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Build update object
    const updates: Database['public']['Tables']['tasks']['Update'] = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.task_type !== undefined) updates.task_type = body.task_type;
    if (body.status !== undefined) {
      updates.status = body.status;
      // Auto-set completed_at when marking as done
      if (body.status === 'done' && !body.completed_at) {
        updates.completed_at = new Date().toISOString();
      }
    }
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to;
    if (body.due_date !== undefined) updates.due_date = body.due_date;
    if (body.completed_at !== undefined) updates.completed_at = body.completed_at;
    if (body.estimated_hours !== undefined) updates.estimated_hours = body.estimated_hours;
    if (body.actual_hours !== undefined) updates.actual_hours = body.actual_hours;
    if (body.blockers !== undefined) updates.blockers = body.blockers;

    // Update task - RLS automatically filters by user_id
    const { data, error } = await (supabase as any)
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          formatApiResponse(null, 'Task not found'),
          { status: 404, headers: addCorsHeaders(new Headers()) }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to update task'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    return NextResponse.json(
      formatApiResponse(data, null),
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

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
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
        formatApiResponse(null, 'Invalid task ID format'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Delete task - RLS automatically filters by user_id
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to delete task'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    return NextResponse.json(
      formatApiResponse({ id }, null),
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

// OPTIONS /api/tasks/[id] - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
