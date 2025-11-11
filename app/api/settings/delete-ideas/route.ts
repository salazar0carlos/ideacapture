import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
} from '@/lib/api-helpers';
import { resetIdeasCount } from '@/lib/subscription-helpers';

// DELETE /api/settings/delete-ideas - Delete all user ideas
export async function DELETE(request: NextRequest) {
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

    // Delete all user ideas - RLS policies automatically filter by user_id
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        formatApiResponse(null, 'Failed to delete ideas'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Reset ideas count for the user
    await resetIdeasCount(supabase, user.id);

    return NextResponse.json(
      formatApiResponse({ message: 'All ideas deleted successfully' }, null),
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

// OPTIONS /api/settings/delete-ideas - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
