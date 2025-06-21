import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Contact {
  id: string
  name: string
  email: string | null
}

// Template ID mapping based on user's provided IDs
const TEMPLATE_IDS = {
  customer: {
    en: '887ea132-5230-4638-b217-4dfc4fe8858e',
    gr: '34e1b729-92e0-42d2-a3f6-db58319f80bf'
  },
  partner: {
    en: '5f1956dc-8660-451d-aa5c-5943fcd87100',
    gr: '9fce18c1-3078-4ff5-b5c2-081ac79b8e3f'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contactIds, language = 'en', targetAudience } = await request.json()

    console.log('Send quick email request:', { contactIds, language, targetAudience })

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'Contact IDs are required' },
        { status: 400 }
      )
    }

    if (!targetAudience || !['customer', 'partner'].includes(targetAudience)) {
      return NextResponse.json(
        { error: 'Valid target audience is required (customer or partner)' },
        { status: 400 }
      )
    }

    // Get the template ID based on target audience and language
    const templateId = TEMPLATE_IDS[targetAudience as keyof typeof TEMPLATE_IDS]?.[language as keyof typeof TEMPLATE_IDS.customer]
    
    if (!templateId) {
      console.error('Template ID not found for:', { targetAudience, language })
      return NextResponse.json(
        { error: `Template not found for ${targetAudience} in ${language}` },
        { status: 404 }
      )
    }

    console.log('Using template ID:', templateId)

    // Find the template by ID
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      console.error('Template lookup error:', templateError)
      console.error('Template lookup failed for ID:', templateId)
      return NextResponse.json(
        { error: 'Email template not found in database' },
        { status: 404 }
      )
    }

    console.log('Found template:', { id: template.id, name: template.name })

    // Get contact details
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name, email')
      .in('id', contactIds)

    if (contactsError || !contacts || contacts.length === 0) {
      console.error('Contacts error:', contactsError)
      return NextResponse.json(
        { error: 'Contacts not found' },
        { status: 404 }
      )
    }

    // Filter contacts that have email addresses
    const contactsWithEmail = (contacts as Contact[]).filter((contact: Contact) => contact.email)
    
    if (contactsWithEmail.length === 0) {
      return NextResponse.json(
        { error: 'No contacts have email addresses' },
        { status: 400 }
      )
    }

    console.log('Sending to contacts:', contactsWithEmail.map(c => ({ name: c.name, email: c.email })))

    // For now, we'll just create a record in sent_emails table
    // In production, you would integrate with your email service (Resend, etc.)
    const emailRecords = contactsWithEmail.map((contact: Contact) => ({
      member_id: template.member_id,
      contact_id: contact.id,
      template_id: template.id,
      recipient_email: contact.email,
      recipient_name: contact.name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text,
      status: 'sent',
      sent_at: new Date().toISOString(),
    }))

    // Insert email records
    const { data: sentEmails, error: insertError } = await supabase
      .from('sent_emails')
      .insert(emailRecords)
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to record email sending' },
        { status: 500 }
      )
    }

    // Update template usage
    await supabase
      .from('email_templates')
      .update({
        usage_count: (template.usage_count || 0) + contactsWithEmail.length,
        last_used_at: new Date().toISOString()
      })
      .eq('id', template.id)

    // Update contact last_contacted_at
    await supabase
      .from('contacts')
      .update({ last_contacted_at: new Date().toISOString() })
      .in('id', contactsWithEmail.map((c: Contact) => c.id))

    console.log('Successfully sent emails:', sentEmails?.length)

    return NextResponse.json({
      success: true,
      data: {
        emailsSent: sentEmails?.length || 0,
        recipients: contactsWithEmail.map((c: Contact) => ({
          id: c.id,
          name: c.name,
          email: c.email
        })),
        template: {
          id: template.id,
          name: template.name,
          subject: template.subject
        }
      }
    })

  } catch (error) {
    console.error('Send quick email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 