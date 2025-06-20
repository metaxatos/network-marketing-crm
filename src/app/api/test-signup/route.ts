import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function GET(req: NextRequest) {
  console.log('[Test Signup] Starting test...')
  
  try {
    // Test 1: Environment variables
    const env = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
    }
    
    console.log('[Test Signup] Environment:', env)
    
    // Test 2: Can we create Supabase client?
    let supabaseOk = false
    let supabaseError = null
    
    try {
      const supabase = await createApiClient(req)
      supabaseOk = true
      console.log('[Test Signup] Supabase client created successfully')
      
      // Test 3: Can we query companies?
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1)
        
      if (companyError) {
        console.error('[Test Signup] Company query error:', companyError)
        return Response.json({
          error: 'Company query failed',
          details: companyError,
          env
        }, { status: 500 })
      }
      
      console.log('[Test Signup] Found companies:', companies)
      
      // Test 4: Check members table
      const { count, error: memberError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        
      if (memberError) {
        console.error('[Test Signup] Members query error:', memberError)
        return Response.json({
          error: 'Members query failed',
          details: memberError,
          env
        }, { status: 500 })
      }
      
      console.log('[Test Signup] Members count:', count)
      
      return Response.json({
        status: 'ok',
        env,
        tests: {
          supabase_client: 'OK',
          companies_query: 'OK',
          members_table: 'OK',
          member_count: count
        },
        company: companies?.[0] || null
      })
      
    } catch (clientError: any) {
      supabaseError = clientError.message
      console.error('[Test Signup] Supabase client error:', clientError)
      return Response.json({
        error: 'Supabase client creation failed',
        details: clientError.message,
        stack: clientError.stack,
        env
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('[Test Signup] Unexpected error:', error)
    return Response.json({
      error: 'Test failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
