import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { template_id, new_name } = await request.json()
    
    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the RPC function to duplicate the template
    const { data: personalTemplateId, error } = await supabase
      .rpc('duplicate_template_for_personal_use', {
        p_template_id: template_id,
        p_new_name: new_name
      })

    if (error) {
      console.error('Error duplicating template:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get the newly created personal template
    const { data: personalTemplate, error: fetchError } = await supabase
      .from('personal_email_templates')
      .select(`
        *,
        email_templates!parent_template_id (
          name,
          category
        )
      `)
      .eq('id', personalTemplateId)
      .single()

    if (fetchError) {
      console.error('Error fetching created template:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch created template' }, { status: 500 })
    }

    return NextResponse.json({ data: personalTemplate })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 