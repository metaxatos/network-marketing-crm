import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  console.log('🍪 Cookie Debug - Starting analysis...')
  
  // Check request headers
  const cookieHeader = req.headers.get('cookie')
  console.log('🍪 Cookie Header:', cookieHeader ? `Present (${cookieHeader.length} chars)` : 'NOT PRESENT')
  
  // Check NextRequest cookies
  const requestCookies = req.cookies.getAll()
  console.log('🍪 Request Cookies Count:', requestCookies.length)
  
  // Find auth cookies
  const authCookies = requestCookies.filter(c => 
    c.name.includes('sb-') || 
    c.name.includes('auth-token')
  )
  console.log('🍪 Auth Cookies Found:', authCookies.length)
  
  authCookies.forEach(cookie => {
    console.log(`🍪 Auth Cookie: ${cookie.name} = ${cookie.value.substring(0, 50)}...`)
  })
  
  // Check if we have the specific auth token
  const authToken = requestCookies.find(c => c.name.includes('auth-token'))
  const hasValidAuth = !!authToken && authToken.value.length > 100
  
  return NextResponse.json({
    cookieHeader: !!cookieHeader,
    cookieHeaderLength: cookieHeader?.length || 0,
    requestCookiesCount: requestCookies.length,
    authCookiesCount: authCookies.length,
    hasValidAuth,
    authCookieNames: authCookies.map(c => c.name),
    timestamp: new Date().toISOString()
  })
} 