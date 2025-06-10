import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return apiError('Not authenticated', 401)
    }

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return apiError('Logout failed. Please try again.', 500)
    }

    // Log activity
    await supabase.from('member_activities').insert({
      member_id: user.id,
      activity_type: 'logout',
      metadata: {
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return apiResponse(
      { message: 'Logged out successfully' },
      200,
      'Logout successful'
    )
  } catch (error) {
    console.error('Logout error:', error)
    return apiError('An unexpected error occurred', 500)
  }
} 