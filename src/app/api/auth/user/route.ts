import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()

    // Get member with profile
    const { data: member, error } = await supabase
      .from('members')
      .select(`
        *,
        member_profiles!member_id (
          first_name,
          last_name,
          avatar_url,
          timezone,
          preferences
        )
      `)
      .eq('id', userId)
      .single()

    if (error || !member) {
      return apiError('Failed to get user information', 404)
    }

    // Get user's company info
    let company = null
    if (member.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, domain')
        .eq('id', member.company_id)
        .single()
      
      company = companyData
    }

    // Format response
    const userProfile = member.member_profiles?.[0] || null

    return apiResponse({
      user: {
        id: member.id,
        email: member.email,
        username: member.username,
        status: member.status,
        level: member.level,
        profile: userProfile ? {
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          avatarUrl: userProfile.avatar_url,
          timezone: userProfile.timezone,
          preferences: userProfile.preferences,
        } : null,
        company: company,
        sponsorId: member.sponsor_id,
        createdAt: member.created_at,
      },
    }, 200)
  } catch (error) {
    console.error('Get user error:', error)
    return apiError('Failed to retrieve user information', 500)
  }
}) 