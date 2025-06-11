import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q')?.trim().toLowerCase()

    if (!query || query.length < 4) {
      return apiError('Query must be at least 4 characters', 400)
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('members')
      .select('id, username, email, member_profiles(first_name,last_name)')
      .or(`username.ilike.%${query}%, member_profiles.first_name.ilike.%${query}%, member_profiles.last_name.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error('Sponsor search error:', error)
      return apiError('Failed to search members', 500)
    }

    // Map to simple structure
    const results = (data || []).map((m: any) => ({
      id: m.id,
      username: m.username,
      name: `${m.member_profiles?.first_name || ''} ${m.member_profiles?.last_name || ''}`.trim(),
      email: m.email,
    }))

    return apiResponse(results, 200, 'Members found')
  } catch (error) {
    console.error('Sponsor search API error:', error)
    return apiError('Unexpected error', 500)
  }
} 