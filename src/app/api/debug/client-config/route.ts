import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  return apiResponse({
    client: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      nodeEnv: process.env.NODE_ENV,
      isServer: typeof window === 'undefined',
    }
  }, 200)
} 