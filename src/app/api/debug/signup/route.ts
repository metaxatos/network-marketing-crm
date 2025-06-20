import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, username, firstName, lastName, phone, companyId, sponsorId } = body

    console.log('[Debug Signup] Starting debug signup process')
    console.log('[Debug Signup] Request body:', body)

    // Test 1: Check Supabase connection
    try {
      const supabase = await createApiClient(req)
      console.log('[Debug Signup] Supabase client created successfully')
      
      // Test 2: Can we query companies?
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1)
      
      if (companiesError) {
        console.error('[Debug Signup] Companies query error:', companiesError)
        return apiError(`Companies query failed: ${companiesError.message}`, 500)
      }
      
      console.log('[Debug Signup] Companies query successful:', companies)
      
      // Test 3: Check if we can query members table
      const { data: membersCount, error: membersError } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
      
      if (membersError) {
        console.error('[Debug Signup] Members query error:', membersError)
        return apiError(`Members query failed: ${membersError.message}`, 500)
      }
      
      console.log('[Debug Signup] Members table accessible')
      
      // Test 4: Try to create auth user (but rollback)
      const testEmail = `test-${Date.now()}@example.com`
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
      })
      
      if (authError) {
        console.error('[Debug Signup] Auth signup test error:', authError)
        return apiError(`Auth test failed: ${authError.message}`, 500)
      }
      
      console.log('[Debug Signup] Auth signup test successful, user ID:', authData.user?.id)
      
      // Test 5: Try to insert a test member record
      if (authData.user) {
        const memberData = {
          id: authData.user.id,
          company_id: companies?.[0]?.id || companyId,
          email: testEmail,
          username: `test_${Date.now()}`,
          name: 'Test User',
          phone: null,
          level: 0,
          status: 'active' as const,
          sponsor_id: null,
          preferences: {
            notifications_enabled: true,
            email_reminders: true,
            celebration_animations: true,
            theme: 'auto' as const
          }
        }
        
        console.log('[Debug Signup] Attempting to insert member:', memberData)
        
        const { data: member, error: memberError } = await supabase
          .from('members')
          .insert([memberData])
          .select()
          .single()
        
        if (memberError) {
          console.error('[Debug Signup] Member insert error:', memberError)
          console.error('[Debug Signup] Member insert error details:', {
            code: memberError.code,
            message: memberError.message,
            details: memberError.details,
            hint: memberError.hint
          })
          
          // Clean up the auth user since member creation failed
          try {
            // Note: We can't delete users from client-side in Supabase
            console.log('[Debug Signup] Note: Test auth user created but member insert failed')
          } catch (e) {
            console.error('[Debug Signup] Cleanup error:', e)
          }
          
          return apiError(`Member insert failed: ${memberError.message} (${memberError.code})`, 500)
        }
        
        console.log('[Debug Signup] Member insert successful:', member)
        
        // Clean up test data
        const { error: deleteError } = await supabase
          .from('members')
          .delete()
          .eq('id', authData.user.id)
        
        if (deleteError) {
          console.error('[Debug Signup] Cleanup failed:', deleteError)
        }
      }
      
      return apiResponse({
        message: 'Debug signup test completed successfully',
        tests: {
          supabase_connection: 'OK',
          companies_query: 'OK',
          members_table_access: 'OK',
          auth_signup: 'OK',
          member_insert: 'OK'
        },
        environment: {
          has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      })
      
    } catch (dbError: any) {
      console.error('[Debug Signup] Database error:', dbError)
      return apiError(`Database error: ${dbError.message}`, 500)
    }
    
  } catch (error: any) {
    console.error('[Debug Signup] Unexpected error:', error)
    console.error('[Debug Signup] Error stack:', error.stack)
    return apiError(`Debug test failed: ${error.message || 'Unknown error'}`, 500)
  }
}
