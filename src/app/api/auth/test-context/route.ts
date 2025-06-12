// Test endpoint to verify auth context is working
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('[API /auth/test-context] Testing auth context...')
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Test 1: Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('[test-context] Auth error:', authError)
      return NextResponse.json({
        success: false,
        error: authError.message,
        step: 'auth.getUser()'
      }, { status: 401 })
    }

    if (!user) {
      console.log('[test-context] No user found')
      return NextResponse.json({
        success: false,
        error: 'No authenticated user',
        step: 'auth.getUser()'
      }, { status: 401 })
    }

    console.log('[test-context] User found:', user.id)

    // Test 2: Query members table with RLS
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, company_id, status')
      .eq('id', user.id)
      .maybeSingle()

    if (memberError) {
      console.error('[test-context] Member query error:', memberError)
      return NextResponse.json({
        success: false,
        error: memberError.message,
        step: 'members query',
        user: { id: user.id, email: user.email }
      }, { status: 500 })
    }

    // Test 3: Simple auth.uid() check
    const { data: authCheck, error: authCheckError } = await supabase
      .rpc('check_auth_uid')
      .single()

    const response = {
      success: true,
      tests: {
        authUser: {
          success: true,
          userId: user.id,
          email: user.email
        },
        memberQuery: {
          success: !memberError,
          hasMember: !!member,
          member: member ? {
            id: member.id,
            email: member.email,
            company_id: member.company_id,
            status: member.status
          } : null,
          error: memberError ? String(memberError) : undefined
        },
        authUidCheck: {
          success: !authCheckError,
          result: authCheck,
          error: authCheckError ? String(authCheckError) : undefined
        }
      }
    }

    console.log('[test-context] All tests completed:', response)
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('[test-context] Fatal error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      step: 'initialization'
    }, { status: 500 })
  }
} 