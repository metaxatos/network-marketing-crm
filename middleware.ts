import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { config as appConfig } from './src/lib/config'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip middleware for test routes
  const testRoutes = ['/test-auth', '/test-auth-status', '/dashboard-debug', '/diagnostics']
  const isTestRoute = testRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  if (isTestRoute) {
    console.log('[Middleware] Skipping auth check for test route:', request.nextUrl.pathname)
    return supabaseResponse
  }

  const supabase = createServerClient(
    appConfig.database.url,
    appConfig.database.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      console.error('[Middleware] Auth error:', error.message)
    }

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/events', '/training', '/landing-page']
    const authRoutes = ['/auth/login', '/auth/signup', '/(auth)/login', '/(auth)/signup']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )
    const isAuthRoute = authRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    console.log('[Middleware] Path:', request.nextUrl.pathname, 'User:', user?.id, 'Protected:', isProtectedRoute)

    // Redirect logic
    if (!user && isProtectedRoute) {
      // User is not authenticated but trying to access protected route
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      console.log('[Middleware] Redirecting to login')
      return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
      // User is authenticated but trying to access auth routes
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard'
      const url = request.nextUrl.clone()
      url.pathname = redirectUrl
      url.searchParams.delete('redirect')
      console.log('[Middleware] Redirecting authenticated user to:', redirectUrl)
      return NextResponse.redirect(url)
    }
  } catch (error: any) {
    console.error('[Middleware] Unexpected error:', error.message)
    // In case of error, allow the request to continue
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object here instead of the supabaseResponse object

  // Add CSP headers for development
  if (process.env.NODE_ENV === 'development') {
    supabaseResponse.headers.set(
      'Content-Security-Policy',
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; object-src 'none';"
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (they handle their own auth)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
