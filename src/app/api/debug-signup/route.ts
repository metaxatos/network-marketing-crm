import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    console.log('[Debug Signup] Starting...')
    
    // 1. Check environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('[Debug Signup] Environment:', {
      url: supabaseUrl?.substring(0, 30) + '...',
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
    })
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
        }
      }, { status: 500, headers })
    }
    
    // 2. Parse body
    const body = await req.json()
    console.log('[Debug Signup] Body:', body)
    
    // 3. Create Supabase client without cookies (simpler)
    console.log('[Debug Signup] Creating Supabase client...')
    const supabase = createServerClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey, // Use service key if available
      {
        cookies: {
          getAll() { return [] },
          setAll() { }
        }
      }
    )
    
    // 4. Test database connection
    console.log('[Debug Signup] Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('[Debug Signup] Database test error:', testError)
      return NextResponse.json({
        error: 'Database connection failed',
        details: testError,
        url: supabaseUrl?.substring(0, 30) + '...',
      }, { status: 500, headers })
    }
    
    console.log('[Debug Signup] Database connection OK')
    
    // 5. Try to create auth user
    console.log('[Debug Signup] Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    })
    
    if (authError) {
      console.error('[Debug Signup] Auth error:', authError)
      return NextResponse.json({
        error: 'Auth signup failed',
        details: authError.message,
        code: authError.code,
      }, { status: 400, headers })
    }
    
    console.log('[Debug Signup] Auth user created:', authData.user?.id)
    
    // 6. Get default company
    console.log('[Debug Signup] Getting default company...')
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .single()
    
    if (companyError) {
      console.error('[Debug Signup] Company error:', companyError)
      return NextResponse.json({
        error: 'Failed to get company',
        details: companyError,
      }, { status: 500, headers })
    }
    
    console.log('[Debug Signup] Company found:', company.id)
    
    // 7. Create member record
    console.log('[Debug Signup] Creating member record...')
    const memberData = {
      id: authData.user!.id,
      company_id: company.id,
      email: authData.user!.email,
      username: body.username || null,
      name: `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'New User',
      phone: body.phone || null,
      level: 0,
      status: 'active',
      sponsor_id: body.sponsorId || null,
      position: null,
      preferences: {
        notifications_enabled: true,
        email_reminders: true,
        celebration_animations: true,
        theme: 'auto'
      }
    }
    
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single()
    
    if (memberError) {
      console.error('[Debug Signup] Member error:', memberError)
      return NextResponse.json({
        error: 'Failed to create member',
        details: memberError,
        memberData,
      }, { status: 500, headers })
    }
    
    console.log('[Debug Signup] Success! Member created:', member.id)
    
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user!.id,
        email: authData.user!.email,
      },
      member: member,
    }, { status: 201, headers })
    
  } catch (error: any) {
    console.error('[Debug Signup] Unexpected error:', error)
    return NextResponse.json({
      error: 'Unexpected error',
      message: error.message,
      stack: error.stack,
    }, { status: 500, headers })
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
