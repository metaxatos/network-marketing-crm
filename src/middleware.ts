import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })
    
    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Middleware auth error:', error)
    }
    
    // For authenticated routes, redirect to login if no session
    const protectedRoutes = ['/dashboard', '/training', '/campaigns', '/team', '/analytics', '/contacts', '/settings']
    const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    
    if (isProtectedRoute && !session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Don't set CSP headers here - they're already set in next.config.js
    // Just return the response with refreshed session
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // Don't crash the middleware, just continue
    return res
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
