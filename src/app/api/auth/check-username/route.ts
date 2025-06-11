import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api-helpers'

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
      return apiResponse({ available: false, reason: 'Invalid format' })
    }

    const supabase = await createClient()

    // Check if username exists
    const { data, error } = await supabase
      .from('members')
      .select('username')
      .eq('username', username)
      .single()

    if (error && error.code === 'PGRST116') {
      // No rows found, username is available
      return apiResponse({ available: true })
    }

    if (error) {
      console.error('Username check error:', error)
      return apiResponse({ available: false, reason: 'Database error' })
    }

    // Username exists
    return apiResponse({ available: false, reason: 'Username already taken' })
  } catch (error) {
    console.error('Username check API error:', error)
    return apiError('Failed to check username availability', 500)
  }
} 