// Debug endpoint to test member data after RLS fix
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  console.log('[DEBUG /debug/member-test] Testing member data after RLS fix')
  
  try {
    const supabase = await createClient()
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        details: authError?.message
      }, { status: 401 })
    }

    console.log('[debug/member-test] User found:', user.id)

    // Test member query
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, company_id, username, name, avatar_url, phone, status, level, sponsor_id, created_at')
      .eq('id', user.id)
      .single()

    if (memberError) {
      console.error('[debug/member-test] Member query error:', memberError)
      return NextResponse.json({
        success: false,
        error: 'Member query failed',
        details: memberError.message,
        code: memberError.code
      }, { status: 500 })
    }

    console.log('[debug/member-test] Member found:', member?.id)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email
      },
      member: member,
      message: 'RLS policy fixed - member data accessible'
    })

  } catch (error) {
    console.error('[debug/member-test] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 })
  }
} 