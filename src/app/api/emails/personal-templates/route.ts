import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiClient(request)
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get personal templates for the user
    const { data: templates, error } = await supabase
      .from('personal_email_templates')
      .select(`
        *,
        email_templates!parent_template_id (
          name,
          category
        )
      `)
      .eq('member_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching personal templates:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiClient(request)
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { parent_template_id, name, subject, body_html, body_text, category } = await request.json()

    // Create new personal template
    const { data: template, error } = await supabase
      .from('personal_email_templates')
      .insert({
        member_id: user.id,
        parent_template_id,
        name,
        subject,
        body_html,
        body_text,
        category
      })
      .select(`
        *,
        email_templates!parent_template_id (
          name,
          category
        )
      `)
      .single()

    if (error) {
      console.error('Error creating personal template:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: template })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}