import { createServerClient } from '@supabase/ssr'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// For API route handlers - use this for better auth context
export function createRouteClient() {
  return createRouteHandlerClient({ cookies })
}

// For other server components and middleware
export async function createClient() {
  const cookieStore = await cookies()
  
  // Get environment variables directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Netlify.'
    )
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          try {
            const allCookies = cookieStore.getAll()
            console.log('[Supabase Server] Getting cookies:', allCookies.length, 'cookies found')
            return allCookies
          } catch (error) {
            console.error('[Supabase Server] Error getting cookies:', error)
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            console.log('[Supabase Server] Setting', cookiesToSet.length, 'cookies')
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn('[Supabase Server] Failed to set cookies:', error)
          }
        },
      },
    }
  )
}
