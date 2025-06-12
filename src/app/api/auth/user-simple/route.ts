// Simplified user endpoint to fix infinite loading
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('[API /auth/user-simple] Starting simplified request')
  
  try {
    // Use the proper auth helpers for Next.js API routes
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get user with proper auth context
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('[API /auth/user-simple] Auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.log('[API /auth/user-simple] No user found')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    console.log('[API /auth/user-simple] User found:', user.id)

    // Initialize response with user data
    const response = {
      user: {
        id: user.id,
        email: user.email
      },
      member: null as any,
      profile: null as any,
      company: null as any
    }

    // Get member data with proper RLS context
    console.log('[API /auth/user-simple] Querying member data for user:', user.id)
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (memberError) {
      console.error('[API /auth/user-simple] Member query error:', memberError)
      // Still return user data even if member fails
      return NextResponse.json(response)
    }

    if (member) {
      console.log('[API /auth/user-simple] Member found:', member.id)
      response.member = {
        id: member.id,
        company_id: member.company_id,
        email: member.email,
        username: member.username,
        status: member.status,
        level: member.level,
        sponsor_id: member.sponsor_id,
        created_at: member.created_at
      }

      // Get profile data
      console.log('[API /auth/user-simple] Querying profile data')
      const { data: profile, error: profileError } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('member_id', user.id)
        .maybeSingle()

      if (!profileError && profile) {
        console.log('[API /auth/user-simple] Profile found')
        response.profile = {
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          timezone: profile.timezone,
          preferences: profile.preferences
        }
      } else if (profileError) {
        console.warn('[API /auth/user-simple] Profile query error:', profileError)
      }

      // Get company data if member has company_id
      if (member.company_id) {
        console.log('[API /auth/user-simple] Querying company data')
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id, name, domain')
          .eq('id', member.company_id)
          .maybeSingle()

        if (!companyError && company) {
          console.log('[API /auth/user-simple] Company found:', company.name)
          response.company = company
        } else if (companyError) {
          console.warn('[API /auth/user-simple] Company query error:', companyError)
        }
      }
    } else {
      console.warn('[API /auth/user-simple] No member found for user:', user.id)
    }

    console.log('[API /auth/user-simple] Returning response with member:', !!response.member)
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('[API /auth/user-simple] Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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
