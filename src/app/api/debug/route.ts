import { NextResponse } from 'next/server'

export async function GET() {
  // Debug environment variables (without exposing sensitive data)
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
    // Show first few chars of URL to verify it's correct
    supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 25) + '...' || 'not set',
  }

  return NextResponse.json(debug)
}
