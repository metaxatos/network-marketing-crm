// Debug endpoint to inspect cookies being passed to API routes
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Define cookie type
interface Cookie {
  name: string
  value: string
}

export async function GET(request: NextRequest) {
  console.log('[DEBUG /debug/cookies] Inspecting cookies...')
  
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    // Get request headers for comparison
    const requestCookies = request.headers.get('cookie')
    
    console.log('[DEBUG] Raw request cookie header:', requestCookies)
    console.log('[DEBUG] Parsed cookies count:', allCookies.length)
    
    // Look for Supabase-related cookies specifically
    const supabaseCookies = allCookies.filter((cookie: Cookie) => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('sb-') ||
      cookie.name.includes('auth')
    )
    
    return NextResponse.json({
      success: true,
      data: {
        requestCookieHeader: requestCookies,
        totalCookies: allCookies.length,
        allCookieNames: allCookies.map((c: Cookie) => c.name),
        supabaseCookies: supabaseCookies.map((c: Cookie) => ({
          name: c.name,
          hasValue: !!c.value,
          valueLength: c.value?.length || 0
        })),
        // Don't log actual values for security
        cookieDetails: allCookies.map((c: Cookie) => ({
          name: c.name,
          hasValue: !!c.value,
          valueLength: c.value?.length || 0
        }))
      }
    })
  } catch (error) {
    console.error('[DEBUG /debug/cookies] Error:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
} 