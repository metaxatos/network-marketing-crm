import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    // Test basic response
    const basicTest = {
      status: 'API is working',
      timestamp: new Date().toISOString(),
    }

    // Test Supabase connection
    let supabaseTest: { status: string; error: string | null; companiesCount?: number } = { 
      status: 'not tested', 
      error: null 
    }
    
    try {
      const supabase = await createApiClient(req)
      const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        supabaseTest = { status: 'error', error: error.message }
      } else {
        supabaseTest = { status: 'connected', error: null, companiesCount: count || 0 }
      }
    } catch (err: any) {
      supabaseTest = { status: 'error', error: err.message || 'Unknown error' }
    }

    return apiResponse({
      basic: basicTest,
      supabase: supabaseTest
    })
  } catch (error: any) {
    return apiError('Test endpoint error: ' + (error.message || 'Unknown error'), 500)
  }
}
