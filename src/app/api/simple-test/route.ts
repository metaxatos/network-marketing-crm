import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  console.log('[Simple Test] Starting test...')
  
  try {
    // Test 1: Check environment variables
    const env = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
    
    console.log('[Simple Test] Environment check:', {
      hasUrl: !!env.url,
      hasAnonKey: !!env.anonKey,
      hasServiceKey: !!env.serviceKey,
    })
    
    // Test 2: Try to create Supabase client
    if (!env.url || !env.anonKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        details: {
          hasUrl: !!env.url,
          hasAnonKey: !!env.anonKey,
        }
      }, { status: 500 })
    }
    
    // Test 3: Try a simple fetch to Supabase
    const testUrl = `${env.url}/rest/v1/companies?select=count`
    console.log('[Simple Test] Testing URL:', testUrl)
    
    const response = await fetch(testUrl, {
      headers: {
        'apikey': env.anonKey,
        'Authorization': `Bearer ${env.anonKey}`,
      }
    })
    
    const responseText = await response.text()
    console.log('[Simple Test] Response status:', response.status)
    console.log('[Simple Test] Response text:', responseText)
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        hasUrl: !!env.url,
        hasAnonKey: !!env.anonKey,
        hasServiceKey: !!env.serviceKey,
        urlPrefix: env.url ? env.url.substring(0, 30) + '...' : null,
      },
      supabaseTest: {
        status: response.status,
        statusText: response.statusText,
        response: responseText.substring(0, 200),
      }
    })
    
  } catch (error: any) {
    console.error('[Simple Test] Error:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log('[Simple Test POST] Starting test...')
  
  try {
    const body = await req.json()
    console.log('[Simple Test POST] Body received:', body)
    
    return NextResponse.json({
      status: 'ok',
      received: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Simple Test POST] Error:', error)
    return NextResponse.json({
      error: 'POST test failed',
      message: error.message,
    }, { status: 500 })
  }
}
