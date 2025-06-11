import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, validateBody, checkRateLimit, isValidEmail } from '@/lib/api-helpers'
import type { LoginRequest } from '@/types/api'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const canProceed = await checkRateLimit(`login:${ip}`, 5, 60 * 1000) // 5 attempts per minute
    
    if (!canProceed) {
      return apiError('Too many login attempts. Please try again later.', 429)
    }

    // Validate request body
    const body = await validateBody<LoginRequest>(req, (data) => {
      if (!data.email || !data.password) {
        throw new Error('Email and password are required')
      }
      
      if (!isValidEmail(data.email)) {
        throw new Error('Invalid email format')
      }
      
      return {
        email: data.email.toLowerCase().trim(),
        password: data.password,
      }
    })

    // Authenticate with Supabase
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return apiError('Invalid email or password', 401)
      }
      return apiError('Login failed. Please try again.', 500)
    }

    // Get member & profile & company info
    const { data: memberRecord } = await supabase
      .from('members')
      .select(`*, company:companies(id, name, domain)`) // join company
      .eq('id', data.user.id)
      .single()

    const { data: memberProfile } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('member_id', data.user.id)
      .single()

    // Log activity
    await supabase.from('member_activities').insert({
      member_id: data.user.id,
      activity_type: 'login',
      metadata: {
        ip_address: ip,
        user_agent: req.headers.get('user-agent'),
      },
    })

    return apiResponse({
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
      member: memberRecord,
      profile: memberProfile ? {
        firstName: memberProfile.first_name,
        lastName: memberProfile.last_name,
        avatarUrl: memberProfile.avatar_url,
      } : null,
      company: memberRecord?.company || null,
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      },
    }, 200, 'Login successful')
  } catch (error) {
    console.error('Login error:', error)
    return apiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      400
    )
  }
} 