import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Create a Supabase client for API routes with proper authentication
 * This ensures that RLS policies work correctly by maintaining the user session
 */
export async function createApiClient(request?: NextRequest | Request) {
  const cookieStore = await cookies()
  
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('[API Client] Environment check:')
  console.log('[API Client] SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
  console.log('[API Client] ANON_KEY:', supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'NOT SET')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[API Client] Missing environment variables:')
    console.error('[API Client] URL:', supabaseUrl || 'MISSING')
    console.error('[API Client] ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')
    throw new Error(`Missing Supabase environment variables: URL=${!!supabaseUrl}, ANON_KEY=${!!supabaseAnonKey}`)
  }

  // Test if the anon key is valid JWT format
  if (!supabaseAnonKey.startsWith('eyJ')) {
    console.error('[API Client] Invalid anon key format - should start with eyJ')
    throw new Error('Invalid Supabase anon key format')
  }

  // If request is provided, merge cookies from request and cookie store
  const getAllCookies = () => {
    if (request && 'cookies' in request) {
      // NextRequest has a cookies property
      const nextRequest = request as NextRequest
      // Merge cookies from request and cookie store
      const requestCookies = nextRequest.cookies.getAll()
      const storeCookies = cookieStore.getAll()
      
      // Create a map to deduplicate cookies (request cookies take precedence)
      const cookieMap = new Map()
      storeCookies.forEach(cookie => cookieMap.set(cookie.name, cookie))
      requestCookies.forEach(cookie => cookieMap.set(cookie.name, cookie))
      
      return Array.from(cookieMap.values())
    }
    
    // For standard Request or no request, just use cookie store
    return cookieStore.getAll()
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          try {
            const allCookies = getAllCookies()
            console.log('[Supabase API Client] Getting cookies:', allCookies.length, 'cookies found')
            
            // Log auth-related cookies for debugging
            const authCookies = allCookies.filter(c => 
              c.name.includes('sb-') || 
              c.name.includes('auth-token')
            )
            if (authCookies.length > 0) {
              console.log('[Supabase API Client] Auth cookies present:', authCookies.map(c => c.name))
            } else {
              console.log('[Supabase API Client] No auth cookies found')
            }
            
            return allCookies
          } catch (error) {
            console.error('[Supabase API Client] Error getting cookies:', error)
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            console.log('[Supabase API Client] Setting', cookiesToSet.length, 'cookies')
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // This error can be ignored in API routes that are already sending a response
            console.warn('[Supabase API Client] Could not set cookies (expected in API routes):', error)
          }
        },
      },
    }
  )
}
