import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createApiClient(req)
    const { email, password } = await req.json()

    console.log('[Login API] Login attempt for:', email)

    if (!email || !password) {
      return apiError('Email and password are required', 400)
    }

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (authError || !authData.user) {
      console.error('[Login API] Auth error:', authError)
      return apiError('Invalid email or password', 401)
    }

    console.log('[Login API] Auth successful for user:', authData.user.id)

    // Get member data with profile info inline (NEW: simplified structure)
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(`
        id,
        company_id,
        email,
        username,
        first_name,
        last_name,
        name,
        avatar_url,
        timezone,
        level,
        status,
        preferences,
        created_at,
        updated_at
      `)
      .eq('id', authData.user.id)
      .single()

    if (memberError || !member) {
      console.error('[Login API] Member fetch error:', memberError)
      console.error('[Login API] Member details:', {
        authUserId: authData.user.id,
        authUserEmail: authData.user.email,
        memberError: memberError,
        memberExists: !!member
      })
      
      // Check if this is an orphaned auth user (exists in auth but not in members)
      if (!member) {
        console.error('[Login API] ORPHANED USER DETECTED:', {
          userId: authData.user.id,
          email: authData.user.email,
          suggestion: 'User exists in auth.users but not in members table'
        })
        return apiError('Account setup incomplete. Please contact support to complete your profile.', 404)
      }
      
      return apiError(`Login failed: ${(memberError as any)?.message || 'Member profile not found'}`, 404)
    }

    if (member.status !== 'active') {
      return apiError('Account is inactive. Please contact support.', 403)
    }

    // Get company information
    let company = null
    if (member.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, domain, settings')
        .eq('id', member.company_id)
        .single()
      
      company = companyData
    }

    console.log('[Login API] Login successful for member:', member.id)

    return apiResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: member.username,
        firstName: member.first_name,
        lastName: member.last_name,
        avatarUrl: member.avatar_url,
        timezone: member.timezone,
      },
      member: member,
      company: company,
      session: authData.session,
    }, 200)

  } catch (error) {
    console.error('[Login API] Unexpected error:', error)
    return apiError('Internal server error during login', 500)
  }
} 