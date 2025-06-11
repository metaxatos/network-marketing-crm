import { createBrowserClient } from '@supabase/ssr'

// Get environment variables directly to avoid config loading issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a placeholder client that won't crash the app
function createSafeClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing. Auth features will not work.')
    console.warn('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify dashboard.')
    
    // Return a mock client that won't crash the app
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({ 
          eq: () => ({ 
            single: () => ({ data: null, error: new Error('Supabase not configured') }) 
          }),
          limit: () => ({ data: null, error: new Error('Supabase not configured') })
        }),
        insert: () => ({ data: null, error: new Error('Supabase not configured') })
      })
    } as any
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

export function createClient() {
  return createSafeClient()
}

export const supabase = createClient()
