// Test endpoint to verify auth fixes
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  console.log('[API /test-auth-fix] Testing auth fixes...')
  
  try {
    const supabase = await createClient()
    
    // Test 1: Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        step: 'auth.getUser()',
        details: authError?.message
      }, { status: 401 })
    }

    console.log('[test-auth-fix] User found:', user.id)

    // Test 2: Query members table with new fields
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, company_id, username, name, avatar_url, phone, status, level, sponsor_id, created_at')
      .eq('id', user.id)
      .single()

    // Test 3: Query company if member has one
    let company = null
    if (member?.company_id) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, slug, plan_type')
        .eq('id', member.company_id)
        .single()
      
      if (!companyError) {
        company = companyData
      }
    }

    // Test 4: Check auth.uid() function
    const { data: authCheck, error: authCheckError } = await supabase
      .rpc('check_auth_uid')
      .single()

    return NextResponse.json({
      success: true,
      tests: {
        userAuth: {
          passed: !!user,
          userId: user?.id,
          userEmail: user?.email
        },
        memberQuery: {
          passed: !memberError && !!member,
          error: memberError?.message,
          memberId: member?.id,
          memberName: member?.name
        },
        companyQuery: {
          passed: member?.company_id ? !!company : true,
          companyName: company?.name,
          companySlug: company?.slug
        },
        authUidFunction: {
          passed: !authCheckError,
          result: authCheck,
          error: authCheckError?.message
        }
      },
      data: {
        user: user ? { id: user.id, email: user.email } : null,
        member,
        company
      }
    })

  } catch (error) {
    console.error('[test-auth-fix] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 })
  }
} 