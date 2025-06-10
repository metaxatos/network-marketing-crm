import { createClient } from './supabase/client'

// Create a single supabase client for interacting with your database
export const supabase = createClient()

// Types for better TypeScript support
export type { User } from '@supabase/supabase-js' 