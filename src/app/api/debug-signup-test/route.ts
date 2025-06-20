export async function GET(req: Request) {
  return Response.json({ 
    message: "Debug endpoint ready",
    timestamp: new Date().toISOString()
  })
}

export async function POST(req: Request) {
  console.log('[Debug Signup] Request received')
  
  try {
    // Test 1: Can we parse the body?
    console.log('[Debug Signup] Parsing body...')
    const body = await req.json()
    console.log('[Debug Signup] Body parsed:', JSON.stringify(body))
    
    // Test 2: Check environment variables
    console.log('[Debug Signup] Checking environment...')
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    }
    console.log('[Debug Signup] Environment:', envCheck)
    
    // Test 3: Try to import and create Supabase client
    console.log('[Debug Signup] Importing createApiClient...')
    const { createApiClient } = await import('@/lib/supabase/api-client')
    console.log('[Debug Signup] Import successful')
    
    console.log('[Debug Signup] Creating Supabase client...')
    const supabase = await createApiClient(req)
    console.log('[Debug Signup] Supabase client created')
    
    // Test 4: Try a simple database query
    console.log('[Debug Signup] Testing database connection...')
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('[Debug Signup] Database error:', error)
      return Response.json({
        success: false,
        step: 'database_query',
        error: error.message
      }, { status: 500 })
    }
    
    console.log('[Debug Signup] Database query successful:', data)
    
    return Response.json({
      success: true,
      message: 'All tests passed',
      body: body,
      environment: envCheck,
      database: { connected: true, data: data }
    })
    
  } catch (error: any) {
    console.error('[Debug Signup] Error:', error)
    console.error('[Debug Signup] Error stack:', error.stack)
    
    return Response.json({
      success: false,
      step: 'unknown',
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
