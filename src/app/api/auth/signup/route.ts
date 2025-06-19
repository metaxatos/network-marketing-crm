import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createApiClient(req)
    const { email, password, username, firstName, lastName, companyId } = await req.json()

    console.log('[Signup API] Starting signup process for:', email)

    // Basic validation
    if (!email || !password) {
      return apiError('Email and password are required', 400)
    }

    // Check if username is unique (if provided)
    if (username) {
      const { data: existingUser } = await supabase
        .from('members')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        return apiError('Username is already taken', 400)
      }
    }

    // Create auth user
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
      const { data: defaultCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('is_default', true)
        .single()
      
      finalCompanyId = defaultCompany?.id
    }

    if (!finalCompanyId) {
      console.error('[Signup API] No company ID available')
      return apiError('Company setup required', 500)
    }

    // Create member record with profile data inline (NEW: simplified structure)
    const memberData = {
      id: authData.user.id,
      company_id: finalCompanyId,
      email: authData.user.email,
      username: username || null,
      first_name: firstName || null,
      last_name: lastName || null,
      level: 1,
      status: 'active' as const,
      preferences: {
        notifications_enabled: true,
        email_reminders: true,
        celebration_animations: true,
        theme: 'auto' as const
      }
    }

    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single()

    if (memberError) {
      console.error('[Signup API] Member creation error:', memberError)
      // Clean up auth user if member creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return apiError(`Failed to create member profile: ${memberError.message}`, 500)
    }

    console.log('[Signup API] Member created successfully:', member.id)

    // Return success response
    return apiResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: member.username,
        firstName: member.first_name,
        lastName: member.last_name,
      },
      member: member
    }, 201)

  } catch (error) {
    console.error('[Signup API] Unexpected error:', error)
    return apiError('Internal server error during signup', 500)
  }
} 