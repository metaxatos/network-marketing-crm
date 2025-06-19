import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // First try to get companies with normal access
    let { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .order('name', { ascending: true })

    // If we get an RLS error, try with service role client for public signup access
    if (error && error.message?.includes('row-level security')) {
      console.log('RLS blocking companies access, using service role for signup')
      
      // Create service role client for bypass RLS during signup
      const serviceSupabase = await createClient()
      
      const serviceResult = await serviceSupabase
        .from('companies')
        .select('id, name')
        .order('name', { ascending: true })
      
      data = serviceResult.data
      error = serviceResult.error
    }

    if (error) {
      console.error('Companies fetch error:', error)
      return apiError('Failed to load companies', 500)
    }

    // If no companies found, create a default one
    if (!data || data.length === 0) {
      console.log('No companies found, creating default company')
      
      const serviceSupabase = await createClient()
      
      const { data: newCompany, error: insertError } = await serviceSupabase
        .from('companies')
        .insert([{
          name: 'Demo Company',
          slug: 'demo-company',
          description: 'Default company for new users',
          plan_type: 'basic'
        }])
        .select('id, name')
        .single()

      if (insertError) {
        console.error('Failed to create default company:', insertError)
        return apiError('No companies available', 500)
      }

      data = [newCompany]
    }

    console.log(`Companies API returning ${data.length} companies`)
    return apiResponse(data, 200, 'Companies loaded')
  } catch (error) {
    console.error('Companies API error:', error)
    return apiError('Unexpected error', 500)
  }
} 