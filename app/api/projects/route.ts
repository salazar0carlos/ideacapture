import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
} from '@/lib/api-helpers';
import { Database } from '@/lib/database.types';

// GET /api/projects - Fetch all projects for authenticated user
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

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Parse query parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build query - RLS policies automatically filter by user_id
    let query = supabase
      .from('projects')
      .select('*, ideas(title, idea_type)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status && ['planning', 'active', 'paused', 'completed', 'abandoned'].includes(status)) {
      query = query.eq('status', status);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to fetch projects'),
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

// POST /api/projects - Create new project
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
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        formatApiResponse(null, 'Project name is required'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // If converting from an idea, update the idea status
    if (body.idea_id) {
      const { error: ideaUpdateError } = await (supabase as any)
        .from('ideas')
        .update({ status: 'pursuing' })
        .eq('id', body.idea_id)
        .eq('user_id', user.id);

      if (ideaUpdateError) {
        console.error('Failed to update idea status:', ideaUpdateError);
        // Continue anyway - not critical
      }
    }

    // Insert new project
    const { data, error } = await (supabase as any)
      .from('projects')
      .insert({
        user_id: user.id,
        idea_id: body.idea_id || null,
        name: body.name,
        description: body.description || null,
        status: body.status || 'planning',
        start_date: body.start_date || null,
        target_completion_date: body.target_completion_date || null,
        estimated_hours: body.estimated_hours || null,
        budget_usd: body.budget_usd || null,
      } as Database['public']['Tables']['projects']['Insert'])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to create project'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Return created project
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

// OPTIONS /api/projects - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
