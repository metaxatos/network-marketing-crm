import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Companies fetch error:', error)
      return apiError('Failed to load companies', 500)
    }

    return apiResponse(data, 200, 'Companies loaded')
  } catch (error) {
    console.error('Companies API error:', error)
    return apiError('Unexpected error', 500)
  }
} 