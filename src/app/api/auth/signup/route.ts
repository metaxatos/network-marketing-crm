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

    // Check if user already exists (handle existing auth users)
    console.log('[Signup API] Checking for existing users...')
    let authData
    let isExistingUser = false
    
    try {
      // First check if auth user already exists
      const { data: existingAuthUsers } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Get enough users to search through
      })
      
      const existingAuthUser = existingAuthUsers.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
      
      if (existingAuthUser) {
        console.log('[Signup API] Found existing auth user:', existingAuthUser.id)
        isExistingUser = true
        authData = { user: existingAuthUser }
        
        // Check if they have a member profile
        const { data: existingMember } = await adminClient
          .from('members')
          .select('id, email, username, name, first_name, last_name')
          .eq('id', existingAuthUser.id)
          .single()
        
        if (existingMember) {
          console.log('[Signup API] User already has complete profile, redirecting to login')
          return apiError('Account already exists. Please log in instead.', 400, headers)
        }
        
        console.log('[Signup API] Found orphaned auth user, will complete their profile')
      } else {
        // Create new auth user
        console.log('[Signup API] Creating new auth user with admin client...')
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
        console.log('[Signup API] New auth user created:', authData.user.id)
      }
    } catch (authException: any) {
      console.error('[Signup API] Auth check/creation exception:', authException)
      return apiError('Failed to process user account', 500, headers)
    }

    if (!authData?.user) {
      return apiError('Failed to process user account', 500, headers)
    }

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

    // Create or update member record with all profile data inline
    const memberData = {
      id: authData.user.id,
      company_id: finalCompanyId,
      email: authData.user.email,
      username: username || null,
      first_name: firstName || null,
      last_name: lastName || null,
      // Note: name will be auto-generated by our trigger from first_name + last_name
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

    console.log('[Signup API] Creating/updating member record:', memberData)

    // Use admin client to bypass RLS for member creation
    let member
    try {
      if (isExistingUser) {
        console.log('[Signup API] Updating existing user profile to complete registration...')
        
        // For existing users, use upsert to handle potential conflicts
        const { data: memberResult, error: memberError } = await adminClient
          .from('members')
          .upsert([memberData], { onConflict: 'id' })
          .select()
          .single()

        if (memberError) {
          console.error('[Signup API] Member update error:', memberError)
          return apiError(`Failed to complete user profile: ${memberError.message}`, 500, headers)
        }

        member = memberResult
        console.log('[Signup API] Existing user profile completed successfully')
      } else {
        console.log('[Signup API] Creating new member record with UPSERT for safety...')
        
        // Use UPSERT even for "new" users to handle race conditions
        const { data: memberResult, error: memberError } = await adminClient
          .from('members')
          .upsert([memberData], { onConflict: 'id' })
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
          
          return apiError(`Failed to create member profile: ${memberError.message}`, 500, headers)
        }

        member = memberResult
        console.log('[Signup API] New member created/updated successfully with UPSERT')
      }
    } catch (memberException: any) {
      console.error('[Signup API] Member creation/update exception:', memberException)
      return apiError('Failed to process member profile', 500, headers)
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
        firstName: member.first_name || firstName,
        lastName: member.last_name || lastName,
        name: member.name
      },
      member: member,
      company: company,
      message: isExistingUser ? 'User registration completed successfully' : 'User account created successfully'
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
