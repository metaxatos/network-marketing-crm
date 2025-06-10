import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, validateBody, checkRateLimit, isValidEmail, sanitizeInput } from '@/lib/api-helpers'
import type { SignupRequest } from '@/types/api'

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
      
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }
      
      return {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        firstName: sanitizeInput(data.firstName),
        lastName: sanitizeInput(data.lastName),
        companyId: data.companyId,
        sponsorId: data.sponsorId,
      }
    })

    const supabase = await createClient()

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return apiError('An account with this email already exists', 400)
      }
      return apiError('Signup failed. Please try again.', 500)
    }

    if (!authData.user) {
      return apiError('Failed to create user account', 500)
    }

    // Create member record
    const { error: memberError } = await supabase.from('members').insert({
      id: authData.user.id,
      company_id: body.companyId || null,
      sponsor_id: body.sponsorId || null,
      email: body.email,
      status: 'active',
      level: 0,
    })

    if (memberError) {
      console.error('Member creation error:', memberError)
      // Note: User is created but member record failed
      // This should be handled by a cleanup process
    }

    // Create member profile
    const { error: profileError } = await supabase.from('member_profiles').insert({
      member_id: authData.user.id,
      first_name: body.firstName,
      last_name: body.lastName,
      preferences: {
        notifications_enabled: true,
        email_reminders: true,
        celebration_animations: true,
        theme: 'light',
      },
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Log activity
    await supabase.from('member_activities').insert({
      member_id: authData.user.id,
      activity_type: 'signup',
      metadata: {
        sponsor_id: body.sponsorId,
        ip_address: ip,
      },
    })

    return apiResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        profile: {
          firstName: body.firstName,
          lastName: body.lastName,
        },
      },
      message: 'Account created successfully. Please check your email to verify your account.',
    }, 201, 'Signup successful')
  } catch (error) {
    console.error('Signup error:', error)
    return apiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      400
    )
  }
} 