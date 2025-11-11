import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
} from '@/lib/api-helpers';

// DELETE /api/settings/delete-account - Delete user account and all associated data
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

    // Delete user settings first
    const { error: settingsError } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', user.id);

    if (settingsError) {
      console.error('Database error deleting settings:', settingsError);
      // Continue anyway, as settings might not exist
    }

    // Delete all user ideas - CASCADE will handle this automatically
    // but we'll do it explicitly for clarity
    const { error: ideasError } = await supabase
      .from('ideas')
      .delete()
      .eq('user_id', user.id);

    if (ideasError) {
      console.error('Database error deleting ideas:', ideasError);
      // Continue anyway
    }

    // Delete the user account from Supabase Auth
    // Note: This requires admin privileges, so we'll need to use the admin API
    // For now, we'll return a message indicating the user should contact support
    // In production, you'd want to use Supabase Admin API or a webhook

    return NextResponse.json(
      formatApiResponse(
        {
          message:
            'User data deleted. Please sign out to complete account deletion. Note: To fully delete your account, please contact support.',
        },
        null
      ),
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

// OPTIONS /api/settings/delete-account - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
