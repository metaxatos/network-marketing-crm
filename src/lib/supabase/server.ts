import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Main server client for API routes and server components
export async function createClient() {
  const cookieStore = await cookies()
  
  // Get environment variables directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase Server] Environment variables not configured for local development')
    console.log('[Supabase Server] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.log('[Supabase Server] NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET')
    
    // In development, provide a mock client to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase Server] Using development mock client')
      
      // Create a proper mock that includes all the chaining methods
      const mockQuery = {
        select: () => mockQuery,
        insert: () => mockQuery,
        update: () => mockQuery,
        delete: () => mockQuery,
        order: () => mockQuery,
        limit: () => mockQuery,
        filter: () => mockQuery,
        eq: () => mockQuery,
        neq: () => mockQuery,
        gt: () => mockQuery,
        gte: () => mockQuery,
        lt: () => mockQuery,
        lte: () => mockQuery,
        like: () => mockQuery,
        ilike: () => mockQuery,
        is: () => mockQuery,
        in: () => mockQuery,
        contains: () => mockQuery,
        containedBy: () => mockQuery,
        rangeLt: () => mockQuery,
        rangeGt: () => mockQuery,
        rangeGte: () => mockQuery,
        rangeLte: () => mockQuery,
        rangeAdjacent: () => mockQuery,
        overlaps: () => mockQuery,
        textSearch: () => mockQuery,
        match: () => mockQuery,
        not: () => mockQuery,
        or: () => mockQuery,
        then: () => Promise.resolve({ 
          data: [
            { id: '1', name: 'Demo Company', description: 'Default company for development' }
          ], 
          error: null 
        })
      }
      
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          signOut: async () => ({ error: null }),
        },
        from: () => mockQuery,
      } as any
    }
    
    // Only throw error in production
    throw new Error('Missing Supabase environment variables in production')
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
