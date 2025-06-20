import { createApiClient } from '@/lib/supabase/api-client'

export async function POST(req: Request) {
  try {
    console.log('[Signup API v2] Starting signup process...')
    
    // Parse request body
    const body = await req.json()
    const { email, password, username, firstName, lastName, phone, companyId, sponsorId } = body

    console.log('[Signup API v2] Request data:', { email, username })

    // Basic validation
    if (!email || !password) {
      return Response.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 })
    }

    // Create Supabase client
    const supabase = await createApiClient(req)

    // Check if username is unique (if provided)
    if (username) {
      const { data: existingUser, error: usernameError } = await supabase
        .from('members')
        .select('username')
        .eq('username', username)
        .single()

      if (usernameError && usernameError.code !== 'PGRST116') {
        return Response.json({
          success: false,
          message: `Username check failed: ${usernameError.message}`
        }, { status: 500 })
      }

      if (existingUser) {
        return Response.json({
          success: false,
          message: 'Username is already taken'
        }, { status: 400 })
      }
    }

    // Create auth user
    console.log('[Signup API v2] Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error('[Signup API v2] Auth error:', authError)
      return Response.json({
        success: false,
        message: `Signup failed: ${authError.message}`
      }, { status: 400 })
    }

    if (!authData?.user) {
      return Response.json({
        success: false,
        message: 'Failed to create user account'
      }, { status: 500 })
    }

    console.log('[Signup API v2] Auth user created:', authData.user.id)

    // Get default company if none provided
    let finalCompanyId = companyId
    if (!finalCompanyId) {
      const { data: defaultCompany, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single()
      
      if (companyError) {
        console.error('[Signup API v2] Failed to get default company:', companyError)
        return Response.json({
          success: false,
          message: 'Failed to get default company'
        }, { status: 500 })
      }
      
      finalCompanyId = defaultCompany?.id
    }

    if (!finalCompanyId) {
      return Response.json({
        success: false,
        message: 'Company setup required. Please contact support.'
      }, { status: 500 })
    }

    // Create member record
    const memberData = {
      id: authData.user.id,
      company_id: finalCompanyId,
      email: authData.user.email,
      username: username || null,
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'New User',
      phone: phone || null,
      level: 0,
      status: 'active',
      sponsor_id: sponsorId || null,
      position: null,
      preferences: {
        notifications_enabled: true,
        email_reminders: true,
        celebration_animations: true,
        theme: 'auto'
      }
    }

    console.log('[Signup API v2] Creating member record...')
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single()

    if (memberError) {
      console.error('[Signup API v2] Member creation error:', memberError)
      return Response.json({
        success: false,
        message: `Failed to create member profile: ${memberError.message}`
      }, { status: 500 })
    }

    console.log('[Signup API v2] Member created successfully:', member.id)

    // Get company info for response
    const { data: company } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('id', finalCompanyId)
      .single()

    // Return success response
    return Response.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: member.username,
          firstName: firstName,
          lastName: lastName,
        },
        member: member,
        company: company
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('[Signup API v2] Unexpected error:', error)
    console.error('[Signup API v2] Error stack:', error.stack)
    
    return Response.json({
      success: false,
      message: `Internal server error: ${error.message || 'Unknown error'}`
    }, { status: 500 })
  }
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET(req: Request) {
  return Response.json({ 
    message: "This endpoint only accepts POST requests" 
  }, { 
    status: 405,
    headers: {
      'Allow': 'POST, OPTIONS'
    }
  })
}
