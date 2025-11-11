import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
  isValidUUID,
} from '@/lib/api-helpers';

// POST /api/ideas/[id]/transcribe - Transcribe audio for idea (STUB)
export async function POST(
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

    // Verify idea exists and belongs to user - RLS policies automatically filter by user_id
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        formatApiResponse(null, 'Idea not found'),
        { status: 404, headers: addCorsHeaders(new Headers()) }
      );
    }

    // TODO: Implement actual audio transcription
    // This is a stub for future implementation
    // Expected workflow:
    // 1. Extract audio blob from request (FormData)
    // 2. Upload audio to storage (Supabase Storage or S3)
    // 3. Call transcription service (OpenAI Whisper, AssemblyAI, etc.)
    // 4. Update idea with transcript
    // 5. Return transcript to client

    // For now, return a placeholder response
    const stubTranscript = 'Audio transcription coming soon. This feature will support voice-to-text conversion for capturing ideas quickly.';

    return NextResponse.json(
      formatApiResponse(
        {
          idea_id: id,
          transcript: stubTranscript,
          status: 'stub',
          message: 'Audio transcription feature is not yet implemented',
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

// OPTIONS /api/ideas/[id]/transcribe - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}
