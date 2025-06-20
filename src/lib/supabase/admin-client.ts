import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase admin client that bypasses RLS policies
 * This should only be used for server-side operations that require elevated privileges
 * 
 * SECURITY WARNING: This client bypasses all Row Level Security policies
 * Only use for specific admin operations like user signup where RLS would block legitimate operations
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable. This is required for admin operations.')
  }
  
  // Validate service key format (should be longer than anon key and start with eyJ)
  if (!supabaseServiceKey.startsWith('eyJ') || supabaseServiceKey.length < 100) {
    throw new Error('Invalid SUPABASE_SERVICE_ROLE_KEY format')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    // Disable global error handling for admin client
    global: {
      headers: {
        'x-client-info': 'supabase-admin-client'
      }
    }
  })
}

/**
 * Check if the service role key is available
 */
export function hasServiceRoleKey(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY
}