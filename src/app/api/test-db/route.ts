import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[TEST-DB] Starting test...')
    
    // Test 1: Create Supabase client
    const supabase = await createClient()
    console.log('[TEST-DB] Supabase client created')
    
    // Test 2: Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[TEST-DB] Auth check:', { userId: user?.id, error: authError })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        duration: Date.now() - startTime
      })
    }
    
    // Test 3: Simple query without joins
    console.log('[TEST-DB] Attempting simple member query...')
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, company_id, status')
      .eq('id', user.id)
      .single()
    
    console.log('[TEST-DB] Member query result:', { member, error: memberError })
    
    // Test 4: Check if we can query with service role (bypassing RLS)
    const serviceRoleTest = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'available' : 'not available'
    
    return NextResponse.json({
      success: true,
      duration: Date.now() - startTime,
      results: {
        auth: {
          userId: user.id,
          email: user.email
        },
        member: member || null,
        memberError: memberError?.message || null,
        serviceRoleKey: serviceRoleTest
      }
    })
    
  } catch (error: any) {
    console.error('[TEST-DB] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      duration: Date.now() - startTime
    }, { status: 500 })
  }
}
