import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createApiClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get the personal template
    const { data: template, error } = await supabase
      .from('personal_email_templates')
      .select(`
        *,
        email_templates!parent_template_id (
          name as parent_name,
          category
        )
      `)
      .eq('id', id)
      .eq('member_id', user.id)
      .single()

    if (error || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ template })

  } catch (error) {
    console.error('Unexpected error in personal-templates [id] GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createApiClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, subject, body_html, body_text } = body

    // Validate required fields
    if (!name || !subject || !body_html) {
      return NextResponse.json({ error: 'Name, subject, and body_html are required' }, { status: 400 })
    }

    // Update the personal template
    const { data: template, error } = await supabase
      .from('personal_email_templates')
      .update({
        name,
        subject,
        body_html,
        body_text: body_text || body_html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('member_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating personal template:', error)
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }

    if (!template) {
      return NextResponse.json({ error: 'Template not found or not authorized' }, { status: 404 })
    }

    return NextResponse.json({ template })

  } catch (error) {
    console.error('Unexpected error in personal-templates [id] PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createApiClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Delete the personal template
    const { error } = await supabase
      .from('personal_email_templates')
      .delete()
      .eq('id', id)
      .eq('member_id', user.id)

    if (error) {
      console.error('Error deleting personal template:', error)
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Template deleted successfully' })

  } catch (error) {
    console.error('Unexpected error in personal-templates [id] DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}