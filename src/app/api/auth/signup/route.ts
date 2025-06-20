import { createApiClient } from '@/lib/supabase/api-client'
import { createAdminClient, hasServiceRoleKey } from '@/lib/supabase/admin-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function POST(req: Request) {
  try {
    // Add CORS headers for the response
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Parse request body with error handling
    let body: any
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('[Signup API] Failed to parse request body:', parseError)
      return apiError('Invalid request body', 400, headers)
    }

    const { email, password, username, firstName, lastName, phone, companyId, sponsorId } = body

    console.log('[Signup API] Starting signup process for:', email)
    console.log('[Signup API] Request body:', { 
      email, 
      username, 
      firstName, 
      lastName, 
      phone, 
      companyId, 
      sponsorId 
    })

    // Basic validation
    if (!email || !password) {
      return apiError('Email and password are required', 400, headers)
    }

    // Check if service role key is available
    if (!hasServiceRoleKey()) {
      console.error('[Signup API] Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to environment variables.')
      return apiError('Server configuration error. Please contact support.', 500, headers)
    }

    // Create Supabase client with error handling
    let supabase
    try {
      supabase = await createApiClient(req)
    } catch (clientError: any) {
      console.error('[Signup API] Failed to create Supabase client:', clientError)
      return apiError('Failed to initialize database connection', 500, headers)
    }

    // Create admin client for bypassing RLS
    const adminClient = createAdminClient()

    // Check if username is unique (if provided) - using admin client to bypass RLS
    if (username) {
      console.log('[Signup API] Checking username availability:', username)
      try {
        const { data: existingUser, error: usernameError } = await adminClient
          .from('members')
          .select('username')
          .eq('username', username)
          .single()

        if (usernameError && usernameError.code !== 'PGRST116') {
          console.error('[Signup API] Username check error:', usernameError)
          return apiError(`Username check failed: ${usernameError.message}`, 500, headers)
        }

        if (existingUser) {
          return apiError('Username is already taken', 400, headers)
        }
      } catch (err: any) {
        console.error('[Signup API] Username check exception:', err)
        return apiError('Failed to check username availability', 500, headers)
      }
    }

    // Create auth user using admin client to ensure immediate availability
    console.log('[Signup API] Creating auth user with admin client...')
    let authData
    try {
      // Using admin client for auth.signUp ensures the user is created immediately
      // without requiring email confirmation
      const authResult = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email when using admin API
        user_metadata: {
          firstName,
          lastName,
          username
        }
      })

      if (authResult.error) {
        console.error('[Signup API] Auth error:', authResult.error)
        return apiError(`Signup failed: ${authResult.error.message}`, 400, headers)
      }

      authData = authResult.data
    } catch (authException: any) {
      console.error('[Signup API] Auth exception:', authException)
      return apiError('Failed to create user account', 500, headers)
    }

    if (!authData?.user) {
      return apiError('Failed to create user account', 500, headers)
    }

    console.log('[Signup API] Auth user created:', authData.user.id)

    // Get default company if none provided
    let finalCompanyId = companyId
    if (!finalCompanyId) {
      console.log('[Signup API] No company ID provided, fetching default...')
      try {
        const { data: defaultCompany, error: companyError } = await adminClient
          .from('companies')
          .select('id')
          .limit(1)
          .single()
        
        if (companyError) {
          console.error('[Signup API] Failed to get default company:', companyError)
          return apiError('Failed to get default company', 500, headers)
        }
        
        finalCompanyId = defaultCompany?.id
      } catch (companyException: any) {
        console.error('[Signup API] Company fetch exception:', companyException)
        return apiError('Failed to get default company', 500, headers)
      }
    }

    if (!finalCompanyId) {
      console.error('[Signup API] No company ID available')
      return apiError('Company setup required. Please contact support if this persists.', 500, headers)
    }

    console.log('[Signup API] Using company ID:', finalCompanyId)

    // Create member record with all profile data inline
    const memberData = {
      id: authData.user.id,
      company_id: finalCompanyId,
      email: authData.user.email,
      username: username || null,
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'New User',
      phone: phone || null,
      level: 0,
      status: 'active' as const,
      sponsor_id: sponsorId || null,
      position: null, // Explicitly set position to null since it's nullable
      // Store preferences in JSONB for flexibility
      preferences: {
        notifications_enabled: true,
        email_reminders: true,
        celebration_animations: true,
        theme: 'auto' as const
      }
    }

    console.log('[Signup API] Creating member record:', memberData)

    // Use admin client to bypass RLS for member creation
    let member
    try {
      console.log('[Signup API] Using admin client to create member record (bypassing RLS)...')
      
      const { data: memberResult, error: memberError } = await adminClient
        .from('members')
        .insert([memberData])
        .select()
        .single()

      if (memberError) {
        console.error('[Signup API] Member creation error:', memberError)
        console.error('[Signup API] Member creation error details:', {
          code: memberError.code,
          message: memberError.message,
          details: memberError.details,
          hint: memberError.hint
        })
        console.error('[Signup API] Member data that failed:', memberData)
        
        // Note: We can't easily delete the auth user with the admin API
        // The auth user will exist but without a member profile
        console.warn('[Signup API] Auth user created but member profile failed. User may need manual cleanup.')
        
        return apiError(`Failed to create member profile: ${memberError.message}`, 500, headers)
      }

      member = memberResult
    } catch (memberException: any) {
      console.error('[Signup API] Member creation exception:', memberException)
      return apiError('Failed to create member profile', 500, headers)
    }

    console.log('[Signup API] Member created successfully:', member.id)

    // Get company info for response
    let company
    try {
      const { data: companyData } = await adminClient
        .from('companies')
        .select('id, name, slug')
        .eq('id', finalCompanyId)
        .single()
      
      company = companyData
    } catch (companyInfoError: any) {
      console.error('[Signup API] Failed to get company info:', companyInfoError)
      // Non-critical error, continue without company info
    }

    // Return success response
    return apiResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: member.username,
        firstName: firstName,
        lastName: lastName,
      },
      member: member,
      company: company
    }, 201, undefined, headers)

  } catch (error: any) {
    console.error('[Signup API] Unexpected error:', error)
    console.error('[Signup API] Error stack:', error.stack)
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    return apiError(`Internal server error during signup: ${error.message || 'Unknown error'}`, 500, headers)
  }
}

// Handle OPTIONS request for CORS
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

// Handle GET requests with a proper error message
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
