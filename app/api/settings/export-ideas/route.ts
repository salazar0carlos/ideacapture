import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
} from '@/lib/api-helpers';

// GET /api/settings/export-ideas - Export all user ideas as JSON
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

    // Fetch all user ideas - RLS policies automatically filter by user_id
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to fetch ideas for export'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Return ideas as JSON with appropriate headers for download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set(
      'Content-Disposition',
      `attachment; filename="ideacapture-export-${new Date().toISOString().split('T')[0]}.json"`
    );
    addCorsHeaders(headers);

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      formatApiResponse(null, 'Internal server error'),
      { status: 500, headers: addCorsHeaders(new Headers()) }
    );
  }
}

// OPTIONS /api/settings/export-ideas - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
