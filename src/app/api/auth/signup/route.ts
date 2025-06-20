import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
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
      return apiError('Email and password are required', 400)
    }

    const supabase = await createApiClient(req)

    // Check if username is unique (if provided)
    if (username) {
      console.log('[Signup API] Checking username availability:', username)
      const { data: existingUser, error: usernameError } = await supabase
        .from('members')
        .select('username')
        .eq('username', username)
        .single()

      if (usernameError && usernameError.code !== 'PGRST116') {
        console.error('[Signup API] Username check error:', usernameError)
        return apiError(`Username check failed: ${usernameError.message}`, 500)
      }

      if (existingUser) {
        return apiError('Username is already taken', 400)
      }
    }

    // Create auth user
    console.log('[Signup API] Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error('[Signup API] Auth error:', authError)
      return apiError(`Signup failed: ${authError.message}`, 400)
    }

    if (!authData.user) {
      return apiError('Failed to create user account', 500)
    }

    console.log('[Signup API] Auth user created:', authData.user.id)

    // Get default company if none provided
    let finalCompanyId = companyId
    if (!finalCompanyId) {
      console.log('[Signup API] No company ID provided, fetching default...')
      const { data: defaultCompany, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single()
      
      if (companyError) {
        console.error('[Signup API] Failed to get default company:', companyError)
        return apiError('Failed to get default company', 500)
      }
      
      finalCompanyId = defaultCompany?.id
    }

    if (!finalCompanyId) {
      console.error('[Signup API] No company ID available')
      return apiError('Company setup required. Please contact support if this persists.', 500)
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

    const { data: member, error: memberError } = await supabase
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
      
      // Try to clean up the auth user if member creation fails
      // Note: This may not work due to Supabase limitations, but we try anyway
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('[Signup API] Failed to clean up auth user:', deleteError)
      }
      
      return apiError(`Failed to create member profile: ${memberError.message}`, 500)
    }

    console.log('[Signup API] Member created successfully:', member.id)

    // Get company info for response
    const { data: company } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('id', finalCompanyId)
      .single()

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
    }, 201)

  } catch (error: any) {
    console.error('[Signup API] Unexpected error:', error)
    console.error('[Signup API] Error stack:', error.stack)
    return apiError(`Internal server error during signup: ${error.message || 'Unknown error'}`, 500)
  }
} 