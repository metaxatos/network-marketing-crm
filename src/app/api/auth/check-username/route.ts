import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
        message: 'Username must be 3-30 characters, lowercase letters, numbers, underscores, and hyphens only'
      })
    }

    // Use service role to bypass RLS issues temporarily
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables')
      return apiError('Server configuration error', 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if username exists using service role (bypasses RLS)
    const { data: existingUser, error } = await supabase
      .from('members')
      .select('username')
      .eq('username', username.toLowerCase().trim())
      .maybeSingle()

    if (error) {
      console.error('Username check error:', error)
      return apiError('Failed to check username availability', 500)
    }

    const available = !existingUser
    console.log(`Username "${username}" availability:`, available)

    return apiResponse({
      available,
      message: available ? 'Username is available' : 'Username is already taken'
    })

  } catch (error) {
    console.error('Username check error:', error)
    return apiError('Internal server error', 500)
  }
} 