import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get personal email templates for the user
    const { data: personalTemplates, error } = await supabase
      .from('personal_email_templates')
      .select(`
        *,
        email_templates!parent_template_id (
          name as parent_name,
          category
        )
      `)
      .eq('member_id', session.user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching personal templates:', error)
      return NextResponse.json({ error: 'Failed to fetch personal templates' }, { status: 500 })
    }

    return NextResponse.json({ templates: personalTemplates || [] })

  } catch (error) {
    console.error('Unexpected error in personal-templates GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { template_id, new_name } = body

    if (!template_id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Call the RPC function to duplicate the template
    const { data: newTemplateId, error } = await supabase
      .rpc('duplicate_template_for_personal_use', {
        p_template_id: template_id,
        p_new_name: new_name
      })

    if (error) {
      console.error('Error duplicating template:', error)
      return NextResponse.json({ error: error.message || 'Failed to duplicate template' }, { status: 500 })
    }

    // Get the newly created template
    const { data: newTemplate, error: fetchError } = await supabase
      .from('personal_email_templates')
      .select('*')
      .eq('id', newTemplateId)
      .single()

    if (fetchError) {
      console.error('Error fetching new template:', fetchError)
      return NextResponse.json({ error: 'Template created but failed to fetch' }, { status: 500 })
    }

    return NextResponse.json({ template: newTemplate })

  } catch (error) {
    console.error('Unexpected error in personal-templates POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 