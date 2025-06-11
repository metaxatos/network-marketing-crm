import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, validateBody, checkRateLimit, isValidEmail, sanitizeInput } from '@/lib/api-helpers'

interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  username?: string
  phone?: string
  companyId?: string | null
  sponsorId?: string | null
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const canProceed = await checkRateLimit(`signup:${ip}`, 3, 60 * 60 * 1000) // 3 signups per hour
    
    if (!canProceed) {
      return apiError('Too many signup attempts. Please try again later.', 429)
    }

    // Validate request body
    const body = await validateBody<SignupRequest>(req, (data) => {
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        throw new Error('Email, password, first name, and last name are required')
      }
      
      if (!isValidEmail(data.email)) {
        throw new Error('Invalid email format')
      }
      
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      // Validate username if provided
      if (data.username) {
        const usernameRegex = /^[a-z0-9_-]+$/
        if (!usernameRegex.test(data.username) || data.username.length < 3 || data.username.length > 30) {
          throw new Error('Username must be 3-30 characters, lowercase letters, numbers, hyphens, and underscores only')
        }
      }

      // Validate phone if provided
      if (data.phone && data.phone.length < 10) {
        throw new Error('Phone number must be at least 10 characters')
      }
      
      return {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        firstName: sanitizeInput(data.firstName),
        lastName: sanitizeInput(data.lastName),
        username: data.username ? sanitizeInput(data.username) : undefined,
        phone: data.phone ? sanitizeInput(data.phone) : undefined,
        companyId: data.companyId || '00000000-0000-0000-0000-000000000001', // Default company
        sponsorId: data.sponsorId || null,
      }
    })

    const supabase = await createClient()

    // Check if username is taken (if provided)
    if (body.username) {
      const { data: existingUsername } = await supabase
        .from('members')
        .select('username')
        .eq('username', body.username)
        .single()

      if (existingUsername) {
        return apiError('Username is already taken', 400)
      }
    }

    // Create user account with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          first_name: body.firstName,
          last_name: body.lastName,
          full_name: `${body.firstName} ${body.lastName}`.trim(),
        }
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      if (authError.message.includes('already registered')) {
        return apiError('An account with this email already exists', 400)
      }
      return apiError('Signup failed. Please try again.', 500)
    }

    if (!authData.user) {
      return apiError('Failed to create user account', 500)
    }

    // Create member record
    const { data: memberData, error: memberError } = await supabase.from('members').insert({
      id: authData.user.id,
      company_id: body.companyId,
      sponsor_id: body.sponsorId,
      email: body.email,
      username: body.username,
      phone: body.phone,
      status: 'active',
      level: 1,
    }).select().single()

    if (memberError) {
      console.error('Member creation error:', memberError)
      return apiError('Failed to create member profile. Please contact support.', 500)
    }

    // Create member profile
    const { data: profileData, error: profileError } = await supabase.from('member_profiles').insert({
      member_id: authData.user.id,
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
      preferences: {
        notifications_enabled: true,
        email_reminders: true,
        celebration_animations: true,
        theme: 'light',
      },
    }).select().single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail here, profile can be created later
    }

    // Get company info
    let companyData = null
    if (body.companyId) {
      const { data: company } = await supabase
        .from('companies')
        .select('id, name, domain')
        .eq('id', body.companyId)
        .single()
      
      companyData = company
    }

    // Log activity
    try {
      await supabase.from('member_activities').insert({
        member_id: authData.user.id,
        activity_type: 'signup',
        metadata: {
          sponsor_id: body.sponsorId,
          ip_address: ip,
          company_id: body.companyId,
        },
      })
    } catch (activityError) {
      console.error('Activity logging error:', activityError)
      // Don't fail signup for activity logging issues
    }

    return apiResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email!,
      },
      member: memberData,
      profile: profileData,
      company: companyData,
      message: authData.user.email_confirmed_at 
        ? 'Account created successfully!' 
        : 'Account created successfully. Please check your email to verify your account.',
    }, 201, 'Signup successful')
  } catch (error) {
    console.error('Signup error:', error)
    return apiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    )
  }
} 