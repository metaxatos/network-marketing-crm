import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Contact {
  id: string
  name: string
  email: string | null
}

export async function POST(request: NextRequest) {
  try {
    const { contactIds, templateName, language = 'en', targetAudience } = await request.json()

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'Contact IDs are required' },
        { status: 400 }
      )
    }

    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      )
    }

    // Find the template by name and language
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .eq('language', language)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      console.error('Template error:', templateError)
      return NextResponse.json(
        { error: 'Email template not found' },
        { status: 404 }
      )
    }

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