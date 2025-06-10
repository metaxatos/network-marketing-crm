import { createBrowserClient } from '@supabase/ssr'

// Get environment variables directly to avoid config loading issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  })
  throw new Error('Missing required Supabase environment variables')
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  )
}

export const supabase = createClient() 