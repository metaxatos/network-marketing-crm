import { NextResponse } from 'next/server'

export async function GET() {
  // Check if environment variables are set
  const envVars = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'NOT SET',
  }

  // Show first part of URL if set (for debugging)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    envVars.supabaseUrlPreview = process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 40) + '...'
  }

  return NextResponse.json({
    status: 'Environment check endpoint',
    timestamp: new Date().toISOString(),
    environment: envVars,
    message: 'If supabaseUrl or supabaseAnonKey show NOT SET, please configure them in Netlify environment variables'
  })
}
