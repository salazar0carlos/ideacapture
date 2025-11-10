import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup'];

// Static assets and Next.js internals to ignore
const ignoredPaths = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/icons',
  '/manifest.json',
  '/sw.js',
  '/workbox-',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for ignored paths
  if (ignoredPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Create a response object
  const res = NextResponse.next();

  // Create Supabase client for middleware
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is not authenticated and trying to access protected route
  if (!session && !publicRoutes.includes(pathname)) {
    const redirectUrl = new URL('/login', req.url);
    // Store the original URL to redirect back after login
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access login/signup
  if (session && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
