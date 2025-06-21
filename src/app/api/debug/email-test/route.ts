import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { testEmail = 'test@example.com' } = await req.json()
    
    console.log('🔍 [Email Debug] Starting comprehensive email test...')
    
    const supabase = await createApiClient(req)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return apiError('Authentication required', 401)
    }

    // Get member data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, company_id, email, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (memberError || !member) {
      return apiError('Member profile not found', 404)
    }

    const results = {
      user_info: {
        user_id: user.id,
        member_email: member.email,
        member_name: `${member.first_name || ''} ${member.last_name || ''}`.trim()
      },
      environment_check: {
        resend_api_key: !!process.env.RESEND_API_KEY,
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        node_env: process.env.NODE_ENV
      },
      tests: [] as any[]
    }

    // Test 1: Direct Resend API
    console.log('🔍 [Email Debug] Testing direct Resend API...')
    try {
      const directResult = await sendEmail({
        to: testEmail,
        subject: 'Test Email - Direct API',
        html: '<h1>Test Email via Direct Resend API</h1><p>This is a test from the direct Resend API method.</p>',
        text: 'Test Email via Direct Resend API - This is a test from the direct Resend API method.',
        replyTo: member.email,
        useEdgeFunction: false
      })
      
      results.tests.push({
        method: 'direct_resend_api',
        success: directResult.success,
        message_id: directResult.messageId,
        error: directResult.error,
        details: directResult
      })
      
      console.log('✅ [Email Debug] Direct API result:', directResult)
    } catch (error) {
      console.error('❌ [Email Debug] Direct API error:', error)
      results.tests.push({
        method: 'direct_resend_api',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      })
    }

    // Test 2: Supabase Edge Function
    console.log('🔍 [Email Debug] Testing Supabase Edge Function...')
    try {
      const edgeResult = await sendEmail({
        to: testEmail,
        subject: 'Test Email - Edge Function',
        html: '<h1>Test Email via Supabase Edge Function</h1><p>This is a test from the Supabase Edge Function method.</p>',
        text: 'Test Email via Supabase Edge Function - This is a test from the Supabase Edge Function method.',
        replyTo: member.email,
        useEdgeFunction: true
      })
      
      results.tests.push({
        method: 'supabase_edge_function',
        success: edgeResult.success,
        message_id: edgeResult.messageId,
        error: edgeResult.error,
        details: edgeResult
      })
      
      console.log('✅ [Email Debug] Edge Function result:', edgeResult)
    } catch (error) {
      console.error('❌ [Email Debug] Edge Function error:', error)
      results.tests.push({
        method: 'supabase_edge_function',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      })
    }

    // Test 3: Manual Edge Function Call
    console.log('🔍 [Email Debug] Testing manual Edge Function call...')
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        const response = await fetch(`${supabaseUrl}/functions/v1/resend-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            to: testEmail,
            subject: 'Test Email - Manual Edge Function Call',
            html: '<h1>Test Email via Manual Edge Function</h1><p>This is a direct test of the Supabase Edge Function.</p>',
            text: 'Test Email via Manual Edge Function - This is a direct test of the Supabase Edge Function.',
            replyTo: member.email,
          }),
        })
        
        const edgeData = await response.json()
        
        results.tests.push({
          method: 'manual_edge_function_call',
          success: response.ok && edgeData.success,
          message_id: edgeData.messageId,
          error: edgeData.error,
          response_status: response.status,
          response_data: edgeData
        })
        
        console.log('✅ [Email Debug] Manual Edge Function result:', { status: response.status, data: edgeData })
      } else {
        results.tests.push({
          method: 'manual_edge_function_call',
          success: false,
          error: 'Missing Supabase URL or Key'
        })
      }
    } catch (error) {
      console.error('❌ [Email Debug] Manual Edge Function error:', error)
      results.tests.push({
        method: 'manual_edge_function_call',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      })
    }

    // Summary
    const successfulTests = results.tests.filter(test => test.success).length
    const totalTests = results.tests.length
    
    console.log(`🔍 [Email Debug] Test completed: ${successfulTests}/${totalTests} methods successful`)

    return apiResponse({
      test_summary: `${successfulTests}/${totalTests} email methods successful`,
      test_email: testEmail,
      ...results
    })

  } catch (error) {
    console.error('❌ [Email Debug] Unexpected error:', error)
    return apiError('Email debug test failed', 500)
  }
}

export async function GET() {
  return apiResponse({
    message: 'Email Debug Test Endpoint',
    usage: 'POST with { "testEmail": "your-email@example.com" }',
    description: 'Tests all email sending methods to debug issues'
  })
} 