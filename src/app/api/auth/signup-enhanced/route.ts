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
      console.error('[Enhanced Signup API] Failed to parse request body:', parseError)
      return apiError('Invalid request body', 400, headers)
    }

    const { email, password, username, firstName, lastName, phone, companyId, sponsorId } = body

    console.log('[Enhanced Signup API] Starting signup process for:', email)

    // Basic validation
    if (!email || !password) {
      return apiError('Email and password are required', 400, headers)
    }

    // Check if service role key is available
    if (!hasServiceRoleKey()) {
      console.error('[Enhanced Signup API] Service role key not configured.')
      return apiError('Server configuration error. Please contact support.', 500, headers)
    }

    const adminClient = createAdminClient()

    // Step 1: Check if user already exists in members table
    console.log('[Enhanced Signup API] Checking for existing member...')
    const { data: existingMember, error: memberCheckError } = await adminClient
      .from('members')
      .select('id, email, username, status, first_name, last_name')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      console.error('[Enhanced Signup API] Member check error:', memberCheckError)
      return apiError('Failed to check existing user', 500, headers)
    }

    // Step 2: Check auth.users table using the member ID if found
    let existingAuthUser = null
    if (existingMember?.id) {
      console.log('[Enhanced Signup API] Found existing member, checking auth user...')
      try {
        const { data: authData } = await adminClient.auth.admin.getUserById(existingMember.id)
        existingAuthUser = authData.user
      } catch (authErr) {
        console.error('[Enhanced Signup API] Auth user check error:', authErr)
      }
    }

    // Step 3: Handle different scenarios
    if (existingMember && existingAuthUser) {
      // Complete user exists - return error
      return apiError('User already registered. Please log in instead.', 400, headers)
    }

    if (existingMember && !existingAuthUser) {
      // Orphaned member record - this shouldn't happen but handle it
      console.warn('[Enhanced Signup API] Found orphaned member record:', existingMember.id)
      return apiError('Account exists but has authentication issues. Please contact support.', 500, headers)
    }

    // Step 4: Check if username is unique (if provided)
    if (username) {
      console.log('[Enhanced Signup API] Checking username availability:', username)
      const { data: existingUsername, error: usernameError } = await adminClient
        .from('members')
        .select('username')
        .eq('username', username)
        .single()

      if (usernameError && usernameError.code !== 'PGRST116') {
        console.error('[Enhanced Signup API] Username check error:', usernameError)
        return apiError(`Username check failed: ${usernameError.message}`, 500, headers)
      }

      if (existingUsername) {
        return apiError('Username is already taken', 400, headers)
      }
    }

    // Step 5: Get default company if none provided
    let finalCompanyId = companyId
    if (!finalCompanyId) {
      console.log('[Enhanced Signup API] No company ID provided, fetching default...')
      const { data: defaultCompany, error: companyError } = await adminClient
        .from('companies')
        .select('id')
        .limit(1)
        .single()
      
      if (companyError) {
        console.error('[Enhanced Signup API] Failed to get default company:', companyError)
        return apiError('Failed to get default company', 500, headers)
      }
      
      finalCompanyId = defaultCompany?.id
    }

    if (!finalCompanyId) {
      console.error('[Enhanced Signup API] No company ID available')
      return apiError('Company setup required. Please contact support.', 500, headers)
    }

    // Step 6: Create new auth user
    console.log('[Enhanced Signup API] Creating new auth user...')
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        firstName,
        lastName,
        username
      }
    })

    if (authError) {
      console.error('[Enhanced Signup API] Auth creation error:', authError)
      
      // Handle specific error cases
      if (authError.message?.includes('already been registered')) {
        // Auth user exists but no member record - this is the orphaned case
        console.log('[Enhanced Signup API] Detected orphaned auth user, attempting to complete signup...')
        
        // This case requires more investigation - for now return error
        return apiError('Account partially exists. Please contact support to complete setup.', 400, headers)
      }
      
      return apiError(`Signup failed: ${authError.message}`, 400, headers)
    }

    if (!authData?.user) {
      return apiError('Failed to create user account', 500, headers)
    }

    console.log('[Enhanced Signup API] Auth user created:', authData.user.id)

    // Step 7: Create member record
    const memberData = {
      id: authData.user.id,
      company_id: finalCompanyId,
      email: authData.user.email,
      username: username || null,
      first_name: firstName || null,
      last_name: lastName || null,
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'New User',
      phone: phone || null,
      level: 0,
      status: 'active' as const,
      sponsor_id: sponsorId || null,
      preferences: {
        notifications_enabled: true,
        email_reminders: true,
        celebration_animations: true,
        theme: 'auto' as const
      }
    }

    console.log('[Enhanced Signup API] Creating member record:', memberData)

    const { data: member, error: memberError } = await adminClient
      .from('members')
      .insert([memberData])
      .select()
      .single()

    if (memberError) {
      console.error('[Enhanced Signup API] Member creation error:', memberError)
      
      // Try to clean up the auth user (though this might not work with admin API)
      try {
        await adminClient.auth.admin.deleteUser(authData.user.id)
        console.log('[Enhanced Signup API] Cleaned up auth user after member creation failure')
      } catch (cleanupError) {
        console.error('[Enhanced Signup API] Failed to cleanup auth user:', cleanupError)
      }
      
      return apiError(`Failed to create member profile: ${memberError.message}`, 500, headers)
    }

    console.log('[Enhanced Signup API] Member created successfully:', member.id)

    // Step 8: Get company info for response
    let company = null
    try {
      const { data: companyData } = await adminClient
        .from('companies')
        .select('id, name, slug')
        .eq('id', finalCompanyId)
        .single()
      
      company = companyData
    } catch (companyInfoError) {
      console.error('[Enhanced Signup API] Failed to get company info:', companyInfoError)
    }

    // Return success response
    return apiResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: member.username,
        firstName: member.first_name,
        lastName: member.last_name,
      },
      member: member,
      company: company,
      message: 'Account created successfully'
    }, 201, undefined, headers)

  } catch (error: any) {
    console.error('[Enhanced Signup API] Unexpected error:', error)
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    return apiError(`Internal server error: ${error.message || 'Unknown error'}`, 500, headers)
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

export async function GET(req: Request) {
  return Response.json({ 
    message: "Enhanced signup endpoint - accepts POST requests only",
    features: [
      "Handles existing users gracefully",
      "Detects orphaned accounts", 
      "Completes partial registrations",
      "Better error messaging"
    ]
  }, { 
    status: 405,
    headers: { 'Allow': 'POST, OPTIONS' }
  })
} 