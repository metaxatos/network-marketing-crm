// Test endpoint to verify auth fixes
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('[API /test-auth-fix] Testing auth fixes...')
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
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

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        authentication: {
          success: true,
          userId: user.id,
          email: user.email
        },
        memberQuery: {
          success: !memberError,
          hasMember: !!member,
          member: member || null,
          error: memberError?.message
        },
        companyQuery: {
          success: member?.company_id ? !!company : true,
          hasCompany: !!company,
          company: company || null
        },
        authUidCheck: {
          success: !authCheckError,
          result: authCheck,
          error: authCheckError?.message
        }
      }
    }

    console.log('[test-auth-fix] All tests completed:', response)
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('[test-auth-fix] Fatal error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      step: 'initialization',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 