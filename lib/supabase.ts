import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Legacy Supabase client (for backwards compatibility)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Client Component Supabase client (for use in Client Components)
export function createSupabaseClient() {
  return createClientComponentClient<Database>();
}

// Server Component Supabase client (for use in Server Components)
// Note: This requires cookies() from 'next/headers' to be passed in
export function createSupabaseServerClient(cookieStore: any) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

// Helper to get current authenticated user
export async function getUser() {
  const supabase = createClientComponentClient<Database>();
  const { data: { user }, error } = await supabase.auth.getUser();

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
