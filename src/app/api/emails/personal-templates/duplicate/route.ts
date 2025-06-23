import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createApiClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { template_id, new_name } = body

    if (!template_id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Get the original template (can be from email_templates or personal_email_templates)
    let originalTemplate = null
    let isPersonalTemplate = false

    // First try to get from personal templates
    const { data: personalTemplate } = await supabase
      .from('personal_email_templates')
      .select('*')
      .eq('id', template_id)
      .eq('member_id', user.id)
      .single()

    if (personalTemplate) {
      originalTemplate = personalTemplate
      isPersonalTemplate = true
    } else {
      // Try to get from global email templates
      const { data: globalTemplate } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', template_id)
        .single()

      if (globalTemplate) {
        originalTemplate = globalTemplate
        isPersonalTemplate = false
      }
    }

    if (!originalTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Create the duplicate personal template
    const duplicateName = new_name || `${originalTemplate.name} (Copy)`
    
    const { data: newTemplate, error } = await supabase
      .from('personal_email_templates')
      .insert({
        member_id: user.id,
        parent_template_id: isPersonalTemplate ? originalTemplate.parent_template_id : template_id,
        name: duplicateName,
        subject: originalTemplate.subject,
        body_html: originalTemplate.body_html,
        body_text: originalTemplate.body_text,
        category: originalTemplate.category || 'custom',
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error duplicating template:', error)
      return NextResponse.json({ error: error.message || 'Failed to duplicate template' }, { status: 500 })
    }

    return NextResponse.json({ template: newTemplate })

  } catch (error) {
    console.error('Unexpected error in personal-templates duplicate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}