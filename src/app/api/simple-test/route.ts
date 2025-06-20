import { createApiClient } from '@/lib/supabase/api-client'

export async function GET(req: Request) {
  try {
    console.log('[Simple Test] Starting test...')
    
    // Test environment variables
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
    
    console.log('[Simple Test] Environment check:', envCheck)
    
    // Test database connection
    let dbTest = { connected: false, error: null as any, data: null as any }
    
    try {
      console.log('[Simple Test] Creating Supabase client...')
      const supabase = await createApiClient(req)
      
      console.log('[Simple Test] Testing database query...')
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1)
        
      if (error) {
        console.error('[Simple Test] Database error:', error)
        dbTest.error = error.message
      } else {
        console.log('[Simple Test] Database query successful:', data)
        dbTest.connected = true
        dbTest.data = data
      }
    } catch (dbError: any) {
      console.error('[Simple Test] Database exception:', dbError)
      dbTest.error = dbError.message
    }
    
    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbTest,
      message: 'Simple test completed'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
    
  } catch (error: any) {
    console.error('[Simple Test] Unexpected error:', error)
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}