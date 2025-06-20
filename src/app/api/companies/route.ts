import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    // Use service role to ensure we can access companies for signup
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables')
      return apiError('Server configuration error', 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, slug, description, plan_type')
      .order('name', { ascending: true })

    if (error) {
      console.error('Companies fetch error:', error)
      return apiError('Failed to load companies', 500)
    }

    // If no companies found, create defaults
    if (!data || data.length === 0) {
      console.log('No companies found, creating default companies')
      
      const defaultCompanies = [
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Demo Company',
          slug: 'demo-company',
          description: 'Default company for new users',
          plan_type: 'basic'
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'Neumi',
          slug: 'neumi',
          description: 'Network marketing company',
          plan_type: 'premium'
        }
      ]

      const { data: newCompanies, error: insertError } = await supabase
        .from('companies')
        .upsert(defaultCompanies, { onConflict: 'id' })
        .select('id, name, slug, description, plan_type')

      if (insertError) {
        console.error('Failed to create default companies:', insertError)
        return apiError('No companies available', 500)
      }

      console.log(`Companies API returning ${newCompanies.length} companies (created)`)
      return apiResponse(newCompanies, 200, 'Companies loaded')
    }

    console.log(`Companies API returning ${data.length} companies`)
    return apiResponse(data, 200, 'Companies loaded')
  } catch (error) {
    console.error('Companies API error:', error)
    return apiError('Unexpected error', 500)
  }
} 