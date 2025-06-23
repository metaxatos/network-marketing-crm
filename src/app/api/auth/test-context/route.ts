import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiClient(request)
    
    // Test authentication context
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({
        authenticated: false,
        error: authError.message,
        user: null
      })
    }
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: 'No user found',
        user: null
      })
    }

    // Get member data if user is authenticated
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, first_name, last_name, name, company_id')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      },
      member: memberError ? null : member,
      memberError: memberError?.message || null
    })

  } catch (error) {
    console.error('Unexpected error in test-context:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}