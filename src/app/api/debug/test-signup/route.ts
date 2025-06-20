import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  let stage = 'initial'
  
  try {
    stage = 'parsing_body'
    const body = await req.json()
    
    stage = 'creating_client'
    const supabase = await createApiClient(req)
    
    stage = 'testing_connection'
    // First, just test if we can connect to Supabase
    const { error: testError } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .single()
    
    if (testError) {
      return apiResponse({
        stage,
        error: 'Supabase connection test failed',
        details: testError.message
      }, 500)
    }
    
    stage = 'creating_test_user'
    // Try to create a test auth user
    const testEmail = `test-${Date.now()}@example.com`
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
    })
    
    if (authError) {
      return apiResponse({
        stage,
        error: 'Auth signup failed',
        details: authError.message,
        code: authError.code
      }, 500)
    }
    
    if (!authData.user) {
      return apiResponse({
        stage,
        error: 'No user returned from signup',
        authData
      }, 500)
    }
    
    return apiResponse({
      success: true,
      stage: 'completed',
      testEmail,
      userId: authData.user.id,
      message: 'Test signup successful - basic auth is working'
    })
    
  } catch (error: any) {
    return apiResponse({
      stage,
      error: 'Exception thrown',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }, 500)
  }
}
