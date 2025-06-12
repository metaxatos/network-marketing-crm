// Simplified user endpoint to fix infinite loading
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('[API /auth/user-simple] Starting simplified request')
  
  try {
    // Use the proper auth helpers for Next.js API routes
    const supabase = createRouteHandlerClient({ cookies })
    
    // First try: Get user with proper auth context
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('[API /auth/user-simple] Primary auth failed, trying manual token approach')
      
      // Fallback: Try manual token approach (common fix for Netlify cookie issues)
      const cookieStore = await cookies()
      const authCookies = cookieStore.getAll()
      console.log('[API /auth/user-simple] Available cookies:', authCookies.map((c: any) => ({ name: c.name, hasValue: !!c.value })))
      
      // Look for Supabase auth token in cookies (different possible names)
      const possibleTokenNames = [
        'sb-auth-token',
        'supabase-auth-token',
        'supabase.auth.token',
        'sb-localhost-auth-token',
        'sb-127-auth-token'
      ]
      
      let authToken = null
      for (const name of possibleTokenNames) {
        const cookie = cookieStore.get(name)
        if (cookie?.value) {
          authToken = cookie.value
          console.log('[API /auth/user-simple] Found auth token in cookie:', name)
          break
        }
      }
      
      // Also check for tokens that might include the project ID
      if (!authToken) {
        const authCookie = authCookies.find((c: any) => 
          c.name.includes('auth-token') || 
          (c.name.startsWith('sb-') && c.name.includes('-auth-token'))
        )
        if (authCookie?.value) {
          authToken = authCookie.value
          console.log('[API /auth/user-simple] Found auth token in dynamic cookie:', authCookie.name)
        }
      }
      
      if (authToken) {
        try {
          // Try to parse the token if it's base64 encoded
          let sessionData = authToken
          if (authToken.startsWith('base64-')) {
            sessionData = atob(authToken.substring(7))
          }
          
          const session = JSON.parse(sessionData)
          console.log('[API /auth/user-simple] Parsed session, access_token exists:', !!session.access_token)
          
          if (session.access_token) {
            // Set the session manually
            const { data: sessionUser, error: sessionError } = await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            })
            
            if (sessionUser?.user && !sessionError) {
              console.log('[API /auth/user-simple] Manual session set successfully')
              // Now get the member data
              const { data: member, error: memberError } = await supabase
                .from('members')
                .select(`
                  id,
                  name,
                  email,
                  avatar_url,
                  company_id,
                  companies!inner (
                    id,
                    name,
                    slug,
                    plan_type
                  )
                `)
                .eq('id', sessionUser.user.id)
                .single()
              
              if (member && !memberError) {
                return NextResponse.json({
                  user: sessionUser.user,
                  member,
                  company: member.companies
                })
              }
            }
          }
        } catch (parseError) {
          console.error('[API /auth/user-simple] Token parse error:', parseError)
        }
      }
      
      return NextResponse.json(
        { error: 'Authentication failed', details: 'Auth session missing!' },
        { status: 401 }
      )
    }

    console.log('[API /auth/user-simple] User authenticated:', user.id)

    // Get member data with RLS context now properly set
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(`
        id,
        name,
        email,
        avatar_url,
        company_id,
        companies!inner (
          id,
          name,
          slug,
          plan_type
        )
      `)
      .eq('id', user.id)
      .single()

    if (memberError) {
      console.error('[API /auth/user-simple] Member fetch error:', memberError)
      return NextResponse.json(
        { 
          error: 'Member data not found', 
          details: memberError.message,
          userId: user.id 
        },
        { status: 404 }
      )
    }

    if (!member) {
      console.log('[API /auth/user-simple] No member found for user:', user.id)
      return NextResponse.json(
        { error: 'Member not found', userId: user.id },
        { status: 404 }
      )
    }

    console.log('[API /auth/user-simple] Success - Member found:', member.id)

    return NextResponse.json({
      user,
      member,
      company: member.companies
    })

  } catch (error) {
    console.error('[API /auth/user-simple] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

// Handle CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
