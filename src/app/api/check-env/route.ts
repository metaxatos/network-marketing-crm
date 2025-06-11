import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  const status = {
    supabaseUrl: {
      exists: !!supabaseUrl,
      value: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
      expected: 'Should start with https://'
    },
    supabaseAnonKey: {
      exists: !!supabaseAnonKey,
      value: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'NOT SET',
      expected: 'Should be a JWT token'
    },
    appUrl: {
      exists: !!appUrl,
      value: appUrl || 'NOT SET',
      expected: 'Should be your Netlify URL'
    },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(status);
}
