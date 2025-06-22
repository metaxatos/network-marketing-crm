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
        getUser: async () => ({ data: { user: null }, error: null }),
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
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return document.cookie
            .split(';')
            .map(cookie => cookie.trim())
            .filter(cookie => cookie.length > 0)
            .map(cookie => {
              const [name, ...rest] = cookie.split('=')
              return {
                name: name.trim(),
                value: rest.join('=')
              }
            })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // For localhost development, use more permissive cookie settings
            const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            
            let cookieString = `${name}=${value}`
            
            if (options?.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`
            }
            
            if (options?.expires) {
              cookieString += `; Expires=${options.expires.toUTCString()}`
            }
            
            if (options?.path) {
              cookieString += `; Path=${options.path}`
            }
            
            // For development, don't set domain to allow localhost
            if (options?.domain && !isDevelopment) {
              cookieString += `; Domain=${options.domain}`
            }
            
            // For development, use Lax instead of Strict for SameSite
            if (options?.sameSite) {
              const sameSite = isDevelopment ? 'Lax' : options.sameSite
              cookieString += `; SameSite=${sameSite}`
            } else if (isDevelopment) {
              cookieString += `; SameSite=Lax`
            }
            
            // Only set Secure in production or on HTTPS
            if (options?.secure && (window.location.protocol === 'https:' || !isDevelopment)) {
              cookieString += `; Secure`
            }
            
            if (options?.httpOnly) {
              cookieString += `; HttpOnly`
            }
            
            // Only log cookie name in development, never the full value for security
            if (process.env.NODE_ENV === 'development') {
              console.log('🍪 Setting cookie:', name)
            }
            
            document.cookie = cookieString
          })
        }
      }
    }
  )
}

export function createClient() {
  return createSafeClient()
}

export const supabase = createClient()
