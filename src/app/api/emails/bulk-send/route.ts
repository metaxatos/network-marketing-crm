import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { 
      contact_ids, 
      template_id, 
      personal_template_id, 
      custom_variables = {} 
    } = await request.json()
    
    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate inputs
    if (!contact_ids || contact_ids.length === 0) {
      return NextResponse.json({ error: 'Contact IDs are required' }, { status: 400 })
    }

    if (!template_id && !personal_template_id) {
      return NextResponse.json({ 
        error: 'Either template_id or personal_template_id must be provided' 
      }, { status: 400 })
    }

    // Call the RPC function to send bulk emails
    const { data: jobId, error } = await supabase
      .rpc('send_bulk_emails', {
        p_contact_ids: contact_ids,
        p_template_id: template_id,
        p_personal_template_id: personal_template_id,
        p_custom_variables: custom_variables
      })

    if (error) {
      console.error('Error starting bulk email job:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: { job_id: jobId } })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('job_id')
    
    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Get bulk email job status
    const { data: job, error } = await supabase
      .from('bulk_email_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      console.error('Error fetching bulk email job:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: job })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 