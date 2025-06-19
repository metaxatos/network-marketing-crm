// Simple user endpoint to fix auth timeouts
import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createApiClient(req)

    // Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return apiError('Unauthorized', 401)
    }

    console.log('[User Simple API] Fetching user data for:', user.id)

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
        avatar_url,
        timezone,
        level,
        status,
        preferences,
        created_at,
        updated_at
      `)
      .eq('id', user.id)
      .single()

    if (memberError) {
      console.error('[User Simple API] Member fetch error:', memberError)
      return apiError('User profile not found', 404)
    }

    // Get company info if available
    let company = null
    if (member.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, domain')
        .eq('id', member.company_id)
        .single()
      
      company = companyData
    }

    // Return simplified user data
    return apiResponse({
      id: user.id,
      email: user.email,
      username: member.username,
      firstName: member.first_name,
      lastName: member.last_name,
      fullName: member.first_name && member.last_name 
        ? `${member.first_name} ${member.last_name}` 
        : member.first_name || member.last_name || null,
      avatarUrl: member.avatar_url,
      timezone: member.timezone,
      level: member.level,
      status: member.status,
      preferences: member.preferences || {
        notifications_enabled: true,
        email_reminders: true,
        celebration_animations: true,
        theme: 'auto'
      },
      company: company,
      emailConfirmed: !!user.email_confirmed_at,
      lastSignIn: user.last_sign_in_at,
      createdAt: member.created_at,
    })

  } catch (error) {
    console.error('[User Simple API] Unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}

// Handle CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
