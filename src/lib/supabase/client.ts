import { createBrowserClient } from '@supabase/ssr'
import { config } from '../config'

export function createClient() {
  return createBrowserClient(
    config.database.url,
    config.database.anonKey
  )
}

export const supabase = createClient() 