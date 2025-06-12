import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api-helpers'

// GET /api/auth/check-username - Check username availability
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')
    
    if (!username) {
      return apiError('Username is required', 400)
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_-]+$/
    if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
      return apiResponse({
        available: false,
        message: 'Username must be 3-30 characters, lowercase letters, numbers, hyphens, and underscores only'
      })
    }

    const supabase = await createClient()
    
    // Check if username exists
    const { data: existingUser, error } = await supabase
      .from('members')
      .select('username')
      .eq('username', username.toLowerCase().trim())
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Username check error:', error)
      return apiError('Failed to check username availability', 500)
    }

    const available = !existingUser

    return apiResponse({
      available,
      username: username.toLowerCase().trim(),
      message: available ? 'Username is available' : 'Username is already taken'
    })

  } catch (error) {
    console.error('Username check error:', error)
    return apiError('Failed to check username availability', 500)
  }
} 