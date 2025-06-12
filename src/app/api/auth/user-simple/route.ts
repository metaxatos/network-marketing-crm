// Simplified user endpoint to fix infinite loading - v2 (RLS policy fixed)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  console.log('[API /auth/user-simple] Starting request - RLS fixed')
  
  try {
    // Use the current server client approach
    const supabase = await createClient()
    
    // Get user with proper auth context
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('[API /auth/user-simple] Auth error:', authError?.message)
      return NextResponse.json(
        { error: 'Authentication failed', details: `Auth session missing! ${authError?.message}` },
        { status: 401 }
      )
    }

    if (!user) {
      console.error('[API /auth/user-simple] No user found')
      return NextResponse.json(
        { error: 'Authentication failed', details: 'Auth session missing!' },
        { status: 401 }
      )
    }

    console.log('[API /auth/user-simple] User authenticated:', user.id)

    // Get member data with a simple query first (no joins) - RLS policy fixed
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, company_id, username, name, avatar_url, phone, status, level, sponsor_id, created_at')
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

    // Get company data separately if member has a company
    let company = null
    if (member.company_id) {
      try {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name, slug, plan_type')
          .eq('id', member.company_id)
          .single()
        
        if (!companyError && companyData) {
          company = companyData
        } else {
          console.warn('[API /auth/user-simple] Company fetch failed:', companyError?.message)
        }
      } catch (companyError) {
        console.warn('[API /auth/user-simple] Company query error:', companyError)
      }
    }

    // Get member profile separately
    let profile = null
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('member_profiles')
        .select('first_name, last_name, avatar_url, timezone, preferences')
        .eq('member_id', user.id)
        .single()
      
      if (!profileError && profileData) {
        profile = profileData
      }
    } catch (profileError) {
      console.warn('[API /auth/user-simple] Profile query error:', profileError)
    }

    console.log('[API /auth/user-simple] Success - Member found:', member.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      member,
      profile,
      company
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
