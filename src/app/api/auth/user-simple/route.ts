// Simplified user endpoint to fix infinite loading
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  console.log('[API /auth/user-simple] Starting simplified request')
  
  try {
    const supabase = await createClient()
    
    // Get user - no timeout wrapper for simplicity
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Return minimal user data first
    const response = {
      user: {
        id: user.id,
        email: user.email
      },
      member: null as any,
      profile: null as any,
      company: null as any
    }

    // Try to get member data with a simple query
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (member && !error) {
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

        // Try to get profile data
        try {
          const { data: profile } = await supabase
            .from('member_profiles')
            .select('*')
            .eq('member_id', user.id)
            .maybeSingle()

          if (profile) {
            response.profile = {
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url,
              timezone: profile.timezone,
              preferences: profile.preferences
            }
          }
        } catch (e) {
          console.warn('[API /auth/user-simple] Profile query failed:', e)
        }

        // Try to get company data if member has company_id
        if (member.company_id) {
          try {
            const { data: company } = await supabase
              .from('companies')
              .select('id, name, domain')
              .eq('id', member.company_id)
              .maybeSingle()

            if (company) {
              response.company = company
            }
          } catch (e) {
            console.warn('[API /auth/user-simple] Company query failed:', e)
          }
        }
      }
    } catch (e) {
      console.error('[API /auth/user-simple] Member query failed:', e)
    }

    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('[API /auth/user-simple] Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
