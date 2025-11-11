import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  validateIdeaUpdateInput,
  formatApiResponse,
  addCorsHeaders,
  isValidUUID,
} from '@/lib/api-helpers';
import { decrementIdeasCount } from '@/lib/subscription-helpers';

// GET /api/ideas/[id] - Fetch single idea by ID
export async function GET(
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

    // Fetch idea - RLS policies automatically filter by user_id
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          formatApiResponse(null, 'Idea not found'),
          { status: 404, headers: addCorsHeaders(new Headers()) }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to fetch idea'),
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

// PATCH /api/ideas/[id] - Update idea
export async function PATCH(
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

    const validation = validateIdeaUpdateInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        formatApiResponse(null, validation.errors?.join(', ') || 'Validation failed'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Update idea - RLS policies automatically filter by user_id
    const updateData: any = {
      ...validation.data!,
      updated_at: new Date().toISOString(),
    };

    // Type assertion needed due to Supabase generated types mismatch
    const { data, error } = await (supabase as any)
      .from('ideas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          formatApiResponse(null, 'Idea not found'),
          { status: 404, headers: addCorsHeaders(new Headers()) }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to update idea'),
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

// DELETE /api/ideas/[id] - Delete idea
export async function DELETE(
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

    // Delete idea - RLS policies automatically filter by user_id
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          formatApiResponse(null, 'Idea not found'),
          { status: 404, headers: addCorsHeaders(new Headers()) }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to delete idea'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Decrement ideas count for the user
    await decrementIdeasCount(supabase, user.id);

    return NextResponse.json(
      formatApiResponse({ message: 'Idea deleted successfully' }, null),
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

// OPTIONS /api/ideas/[id] - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
