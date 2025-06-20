export async function POST(req: Request) {
  console.log('[Test Signup Real] Starting test with real data...')
  
  try {
    // Test the exact signup flow
    const body = await req.json()
    console.log('[Test Signup Real] Request body:', JSON.stringify(body, null, 2))
    
    // Import and create client
    const { createApiClient } = await import('@/lib/supabase/api-client')
    const supabase = await createApiClient(req)
    
    // Test signup with the exact data
    console.log('[Test Signup Real] Calling supabase.auth.signUp...')
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    })
    
    if (error) {
      console.error('[Test Signup Real] Supabase auth error:', error)
      return Response.json({
        success: false,
        step: 'auth_signup',
        error: error.message,
        errorCode: error.code,
        errorDetails: error
      }, { status: 400 })
    }
    
    console.log('[Test Signup Real] Auth signup successful:', data.user?.id)
    
    // If we get here, auth worked but member creation might be failing
    return Response.json({
      success: true,
      message: 'Auth signup worked! The issue is in member creation.',
      authUser: {
        id: data.user?.id,
        email: data.user?.email
      }
    })
    
  } catch (error: any) {
    console.error('[Test Signup Real] Exception:', error)
    return Response.json({
      success: false,
      step: 'exception',
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
