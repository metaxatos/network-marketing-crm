// Simple user endpoint to fix auth timeouts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  console.log('[API /auth/user-simple] Starting simple request')
  
  try {
    const supabase = await createClient()
    
    // Get user with basic timeout
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('[API /auth/user-simple] Auth failed:', authError?.message)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    console.log('[API /auth/user-simple] User authenticated:', user.id)

    // Get member data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, company_id, username, name, avatar_url, phone, status, level, sponsor_id, created_at')
      .eq('id', user.id)
      .single()

    if (memberError || !member) {
      console.error('[API /auth/user-simple] Member not found:', memberError?.message)
      // Return basic user data
      return NextResponse.json({
        user: { id: user.id, email: user.email },
        member: null,
        profile: null,
        company: null
      })
    }

    // Get company if member has one
    let company = null
    if (member.company_id) {
      try {
        const { data: companyData } = await supabase
          .from('companies')
          .select('id, name, slug, plan_type')
          .eq('id', member.company_id)
          .single()
        
        company = companyData
      } catch (error) {
        console.warn('[API /auth/user-simple] Company query failed, continuing without it')
      }
    }

    // Get profile
    let profile = null
    try {
      const { data: profileData } = await supabase
        .from('member_profiles')
        .select('first_name, last_name, avatar_url, timezone, preferences')
        .eq('member_id', user.id)
        .single()
      
      profile = profileData
    } catch (error) {
      console.warn('[API /auth/user-simple] Profile query failed, continuing without it')
    }

    console.log('[API /auth/user-simple] Success - returning complete data')

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      member,
      profile,
      company
    })
    
  } catch (error: any) {
    console.error('[API /auth/user-simple] Request failed:', error.message)
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
