import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  validateIdeaInput,
  formatApiResponse,
  parsePaginationParams,
  parseFilterParams,
  addCorsHeaders,
} from '@/lib/api-helpers';

// GET /api/ideas - Fetch all ideas for authenticated user
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

    // Parse query parameters
    const url = new URL(request.url);
    const { limit, offset } = parsePaginationParams(url);
    const filters = parseFilterParams(url);

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Build query - RLS policies automatically filter by user_id
    let query = supabase
      .from('ideas')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filters.type) {
      query = query.eq('idea_type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to fetch ideas'),
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
        filters: filters,
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

// POST /api/ideas - Create new idea
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

    const validation = validateIdeaInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        formatApiResponse(null, validation.errors?.join(', ') || 'Validation failed'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Insert new idea
    const { data, error } = await supabase
      .from('ideas')
      .insert({
        ...validation.data!,
        user_id: user.id,
        status: 'captured',
        refinement_complete: false,
        validation_enabled: false,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to create idea'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Return created idea
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

// OPTIONS /api/ideas - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
