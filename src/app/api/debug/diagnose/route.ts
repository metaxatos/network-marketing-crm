import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const { test } = await req.json()
    
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    }

    const supabase = await createApiClient(req)

    // Test 1: Basic Supabase connection
    try {
      const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
      
      results.tests.supabaseConnection = {
        success: !error,
        error: error?.message || null,
        companiesCount: count
      }
    } catch (err: any) {
      results.tests.supabaseConnection = {
        success: false,
        error: err.message
      }
    }

    // Test 2: Can query members table
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id')
        .limit(1)
      
      results.tests.membersTableAccess = {
        success: !error,
        error: error?.message || null,
        canRead: true
      }
    } catch (err: any) {
      results.tests.membersTableAccess = {
        success: false,
        error: err.message
      }
    }

    // Test 3: Test auth signup (if requested)
    if (test === 'auth') {
      try {
        const testEmail = `test-${Date.now()}@example.com`
        const { data, error } = await supabase.auth.signUp({
          email: testEmail,
          password: 'TestPassword123!'
        })
        
        results.tests.authSignup = {
          success: !error,
          error: error?.message || null,
          userId: data?.user?.id || null
        }

        // Clean up test user if created
        if (data?.user?.id) {
          // Note: We can't delete the user from client SDK
          results.tests.authSignup.note = 'Test user created but cannot be deleted via client SDK'
        }
      } catch (err: any) {
        results.tests.authSignup = {
          success: false,
          error: err.message
        }
      }
    }

    // Test 4: Check RLS policies
    try {
      const { data, error } = await supabase
        .from('pg_policies')
        .select('tablename, policyname, cmd')
        .eq('schemaname', 'public')
        .eq('tablename', 'members')
      
      results.tests.rlsPolicies = {
        success: !error,
        error: error?.message || null,
        policies: data || []
      }
    } catch (err: any) {
      results.tests.rlsPolicies = {
        success: false,
        error: err.message,
        note: 'This is normal if not using service role key'
      }
    }

    return apiResponse(results)
  } catch (error: any) {
    return apiError('Diagnostic error: ' + error.message, 500)
  }
}

export async function GET() {
  return apiResponse({
    message: 'Use POST method to run diagnostics',
    availableTests: {
      default: 'Basic connection and table access tests',
      auth: 'Include auth signup test (creates a test user)'
    }
  })
}
