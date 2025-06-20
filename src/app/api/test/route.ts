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
    let supabaseTest = { status: 'not tested', error: null }
    try {
      const supabase = await createApiClient(req)
      const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        supabaseTest = { status: 'error', error: error.message }
      } else {
        supabaseTest = { status: 'connected', companiesCount: count }
      }
    } catch (err) {
      supabaseTest = { status: 'error', error: err.message }
    }

    return apiResponse({
      basic: basicTest,
      supabase: supabaseTest
    })
  } catch (error) {
    return apiError('Test endpoint error: ' + error.message, 500)
  }
}
