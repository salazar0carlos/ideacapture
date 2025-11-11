import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

// Lazy-loaded Supabase client to avoid build-time errors
let _supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create new client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  // Client-side: reuse singleton
  if (!_supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return _supabaseClient;
}

// Legacy Supabase client (for backwards compatibility)
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});

// Browser Supabase client (for use in Client Components)
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Helper to get current authenticated user
export async function getUser() {
  const client = createSupabaseBrowserClient();
  const { data: { user }, error } = await client.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

// Helper function to check if we're in the browser
export const isBrowser = () => typeof window !== 'undefined';

// Error handling helper
export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

// Export types for convenience
export type { Database };
