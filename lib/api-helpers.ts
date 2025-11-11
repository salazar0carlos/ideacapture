import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { IdeaType, IdeaStatus, CreateIdeaRequest, UpdateIdeaRequest } from './types';

// Create Supabase client for server-side use with auth context
export function createServerSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Extract auth token from Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Get authenticated user from request
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createServerSupabaseClient(request);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: 'Unauthorized' };
  }

  return { user, error: null };
}

// Validate idea input for creation
export function validateIdeaInput(
  data: unknown
): { valid: boolean; data?: CreateIdeaRequest; errors?: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request body'] };
  }

  const input = data as Record<string, unknown>;

  // Validate title (required)
  if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  } else if (input.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }

  // Validate description (optional)
  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description !== 'string') {
      errors.push('Description must be a string');
    } else if (input.description.length > 5000) {
      errors.push('Description must be 5000 characters or less');
    }
  }

  // Validate idea_type (required)
  const validTypes: IdeaType[] = ['tech', 'business', 'product', 'content', 'other'];
  if (!input.idea_type || typeof input.idea_type !== 'string') {
    errors.push('Idea type is required');
  } else if (!validTypes.includes(input.idea_type as IdeaType)) {
    errors.push(`Idea type must be one of: ${validTypes.join(', ')}`);
  }

  // Validate audio_transcript (optional)
  if (input.audio_transcript !== undefined && input.audio_transcript !== null) {
    if (typeof input.audio_transcript !== 'string') {
      errors.push('Audio transcript must be a string');
    } else if (input.audio_transcript.length > 10000) {
      errors.push('Audio transcript must be 10000 characters or less');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      title: (input.title as string).trim(),
      description: input.description as string | undefined,
      idea_type: input.idea_type as IdeaType,
      audio_transcript: input.audio_transcript as string | undefined,
    },
  };
}

// Validate idea update input
export function validateIdeaUpdateInput(
  data: unknown
): { valid: boolean; data?: UpdateIdeaRequest; errors?: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request body'] };
  }

  const input = data as Record<string, unknown>;

  // Check that at least one field is being updated
  const hasUpdates = Object.keys(input).some((key) =>
    ['title', 'description', 'idea_type', 'refinement_answers', 'refinement_complete', 'status'].includes(key)
  );

  if (!hasUpdates) {
    errors.push('At least one field must be provided for update');
  }

  // Validate title (optional)
  if (input.title !== undefined) {
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
      errors.push('Title must be a non-empty string');
    } else if (input.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }
  }

  // Validate description (optional)
  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description !== 'string') {
      errors.push('Description must be a string');
    } else if (input.description.length > 5000) {
      errors.push('Description must be 5000 characters or less');
    }
  }

  // Validate idea_type (optional)
  if (input.idea_type !== undefined) {
    const validTypes: IdeaType[] = ['tech', 'business', 'product', 'content', 'other'];
    if (!validTypes.includes(input.idea_type as IdeaType)) {
      errors.push(`Idea type must be one of: ${validTypes.join(', ')}`);
    }
  }

  // Validate status (optional)
  if (input.status !== undefined) {
    const validStatuses: IdeaStatus[] = ['captured', 'refining', 'validated', 'pursuing', 'archived'];
    if (!validStatuses.includes(input.status as IdeaStatus)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Validate refinement_answers (optional)
  if (input.refinement_answers !== undefined && input.refinement_answers !== null) {
    if (typeof input.refinement_answers !== 'object' || Array.isArray(input.refinement_answers)) {
      errors.push('Refinement answers must be an object');
    }
  }

  // Validate refinement_complete (optional)
  if (input.refinement_complete !== undefined && typeof input.refinement_complete !== 'boolean') {
    errors.push('Refinement complete must be a boolean');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const updateData: UpdateIdeaRequest = {};
  if (input.title !== undefined) updateData.title = (input.title as string).trim();
  if (input.description !== undefined) updateData.description = input.description as string;
  if (input.idea_type !== undefined) updateData.idea_type = input.idea_type as IdeaType;
  if (input.refinement_answers !== undefined) updateData.refinement_answers = input.refinement_answers as Record<string, string>;
  if (input.refinement_complete !== undefined) updateData.refinement_complete = input.refinement_complete as boolean;
  if (input.status !== undefined) updateData.status = input.status as IdeaStatus;

  return {
    valid: true,
    data: updateData,
  };
}

// Format API response consistently
export function formatApiResponse<T>(
  data: T | null = null,
  error: string | null = null,
  meta?: Record<string, unknown>
) {
  if (error) {
    return {
      success: false,
      error,
      data: null,
    };
  }

  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

// Parse pagination parameters
export function parsePaginationParams(url: URL) {
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

  return { limit, offset };
}

// Parse filter parameters
export function parseFilterParams(url: URL) {
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');

  const filters: {
    type?: IdeaType;
    status?: IdeaStatus;
  } = {};

  const validTypes: IdeaType[] = ['tech', 'business', 'product', 'content', 'other'];
  if (type && validTypes.includes(type as IdeaType)) {
    filters.type = type as IdeaType;
  }

  const validStatuses: IdeaStatus[] = ['captured', 'refining', 'validated', 'pursuing', 'archived'];
  if (status && validStatuses.includes(status as IdeaStatus)) {
    filters.status = status as IdeaStatus;
  }

  return filters;
}

// Add CORS headers
export function addCorsHeaders(headers: Headers) {
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return headers;
}

// Validate UUID format
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
