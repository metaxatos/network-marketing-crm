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
    
    // Check if this is a training/lesson page
    const isTrainingPage = req.nextUrl.pathname.startsWith('/training')
    const isLessonPage = req.nextUrl.pathname.includes('/lesson') || req.nextUrl.pathname.includes('/video')
    
    // For authenticated routes, redirect to login if no session
    const protectedRoutes = ['/dashboard', '/training', '/campaigns', '/team', '/analytics', '/contacts', '/settings']
    const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    
    if (isProtectedRoute && !session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Add security headers for video content
    if (isTrainingPage || isLessonPage) {
      res.headers.set('X-Frame-Options', 'SAMEORIGIN')
      res.headers.set('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://player.vimeo.com https://f.vimeocdn.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https: blob: https://*.vimeo.com https://*.vimeocdn.com; " +
        "media-src 'self' blob: https://player.vimeo.com https://vimeo.com https://*.vimeocdn.com; " +
        "frame-src 'self' https://player.vimeo.com https://vimeo.com; " +
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://player.vimeo.com https://vimeo.com https://*.vimeocdn.com"
      )
    }
    
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
