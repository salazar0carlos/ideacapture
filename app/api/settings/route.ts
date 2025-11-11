import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
} from '@/lib/api-helpers';
import { Database } from '@/lib/database.types';

// GET /api/settings - Fetch user settings
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

    // Fetch user settings - RLS policies automatically filter by user_id
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no settings found, create default settings
    if (error && error.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          validation_enabled: false,
          default_view: 'list',
        } as any)
        .select()
        .single();

      if (createError) {
        console.error('Database error creating settings:', createError);
        return NextResponse.json(
          formatApiResponse(null, 'Failed to create settings'),
          { status: 500, headers: addCorsHeaders(new Headers()) }
        );
      }

      return NextResponse.json(
        formatApiResponse(newSettings, null),
        { status: 200, headers: addCorsHeaders(new Headers()) }
      );
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to fetch settings'),
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

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
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

    // Validate settings input
    const errors: string[] = [];
    const updateData: any = {};

    if (body.validation_enabled !== undefined) {
      if (typeof body.validation_enabled !== 'boolean') {
        errors.push('validation_enabled must be a boolean');
      } else {
        updateData.validation_enabled = body.validation_enabled;
      }
    }

    if (body.default_view !== undefined) {
      const validViews = ['list', 'grid', 'mindmap'];
      if (!validViews.includes(body.default_view)) {
        errors.push('default_view must be one of: list, grid, mindmap');
      } else {
        updateData.default_view = body.default_view;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        formatApiResponse(null, errors.join(', ')),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        formatApiResponse(null, 'No valid fields to update'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client with user context
    const supabase = createServerSupabaseClient(request);

    // Update settings - RLS policies automatically filter by user_id
    // Type assertion needed due to Supabase generated types mismatch
    const { data, error } = await (supabase as any)
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to update settings'),
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

// OPTIONS /api/settings - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
