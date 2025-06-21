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
    console.log('[Send Quick Email] API route called')
    
    const { contactIds, language = 'en', targetAudience } = await request.json()

    console.log('[Send Quick Email] Request data:', { contactIds, language, targetAudience })

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      console.error('[Send Quick Email] Invalid contactIds:', contactIds)
      return NextResponse.json({ error: 'Contact IDs are required' }, { status: 400 })
    }

    if (!targetAudience || !['customer', 'partner'].includes(targetAudience)) {
      console.error('[Send Quick Email] Invalid targetAudience:', targetAudience)
      return NextResponse.json({ error: 'Valid target audience is required' }, { status: 400 })
    }

    // Get template ID based on target audience and language
    const templateId = TEMPLATE_IDS[targetAudience as keyof typeof TEMPLATE_IDS]?.[language as 'en' | 'gr']
    
    if (!templateId) {
      console.error('[Send Quick Email] Template not found for:', { targetAudience, language })
      return NextResponse.json({ 
        error: 'Email template not found',
        details: { targetAudience, language, availableTemplates: TEMPLATE_IDS }
      }, { status: 400 })
    }

    console.log('[Send Quick Email] Using template ID:', templateId)

    // Fetch template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      console.error('[Send Quick Email] Template fetch error:', templateError)
      return NextResponse.json({ 
        error: 'Failed to load template',
        details: { templateId, error: templateError }
      }, { status: 500 })
    }

    console.log('[Send Quick Email] Template loaded:', template.name)

    // Fetch contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name, email')
      .in('id', contactIds)

    if (contactsError) {
      console.error('[Send Quick Email] Contacts fetch error:', contactsError)
      return NextResponse.json({ 
        error: 'Failed to load contacts',
        details: contactsError
      }, { status: 500 })
    }

    if (!contacts || contacts.length === 0) {
      console.error('[Send Quick Email] No contacts found for IDs:', contactIds)
      return NextResponse.json({ error: 'No contacts found' }, { status: 404 })
    }

    console.log('[Send Quick Email] Found contacts:', contacts.length)

    // Filter contacts with valid emails
    const validContacts = contacts.filter((contact: Contact) => 
      contact.email && contact.email.trim() !== ''
    )

    if (validContacts.length === 0) {
      console.error('[Send Quick Email] No contacts with valid emails')
      return NextResponse.json({ error: 'No contacts have valid email addresses' }, { status: 400 })
    }

    console.log('[Send Quick Email] Valid contacts with emails:', validContacts.length)

    // Simulate email sending (replace with actual email service)
    const results = []
    for (const contact of validContacts) {
      try {
        // Here you would integrate with your email service (Resend, etc.)
        console.log(`[Send Quick Email] Simulating email to ${contact.email}`)
        
        results.push({
          contactId: contact.id,
          contactName: contact.name,
          email: contact.email,
          status: 'sent',
          sentAt: new Date().toISOString()
        })
      } catch (emailError) {
        console.error(`[Send Quick Email] Failed to send to ${contact.email}:`, emailError)
        results.push({
          contactId: contact.id,
          contactName: contact.name,
          email: contact.email,
          status: 'failed',
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        })
      }
    }

    console.log('[Send Quick Email] Sending complete. Results:', results)

    return NextResponse.json({
      success: true,
      message: `Email sent to ${results.filter(r => r.status === 'sent').length} recipients`,
      results,
      template: {
        id: template.id,
        name: template.name
      }
    })

  } catch (error) {
    console.error('[Send Quick Email] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 