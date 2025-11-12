import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Authentication Middleware
 *
 * Protects all routes except public paths (login, signup, etc.)
 * Redirects unauthenticated users to /login
 *
 * This middleware is essential for:
 * - Route protection (security)
 * - E2E test expectations (auth flow tests)
 * - User experience (auto-redirect to login)
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Define public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/privacy',
    '/terms',
  ]

  // Check if current path is public
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Allow public paths without auth check
  if (isPublicPath) {
    return response
  }

  try {
    // Create Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Redirect to login if no session
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      // Preserve the original path as redirect target after login
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If authenticated and on login page, redirect to home
    if (session && request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (e) {
    // If auth check fails, redirect to login
    console.error('Middleware auth error:', e)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

/**
 * Matcher configuration
 *
 * Applies middleware to all routes except:
 * - _next/static (Next.js static files)
 * - _next/image (Next.js image optimization)
 * - favicon.ico (favicon)
 * - public folder files (manifest, icons, etc.)
 * - api routes (they handle auth internally)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handle auth internally)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|api/).*)',
  ],
}
