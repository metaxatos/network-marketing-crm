import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  
  return NextResponse.json({
    configured: {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
      appUrl: !!appUrl,
      appName: !!appName,
    },
    values: {
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Missing',
      supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing',
      appUrl: appUrl || 'Missing',
      appName: appName || 'Missing',
    },
    timestamp: new Date().toISOString(),
  });
}
