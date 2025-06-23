import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { populateEmailVariables, replaceEmailVariables } from '@/lib/email-variables'

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
    const supabase = await createClient()
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

    // Get current user for email variables
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[Send Quick Email] Authentication error:', authError)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get member data for email variables and reply-to
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, company_id, email, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (memberError || !member) {
      console.error('[Send Quick Email] Member not found:', memberError)
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 })
    }

    // Send actual emails using Resend
    const results = []
    for (const contact of validContacts) {
      try {
        console.log(`[Send Quick Email] Sending email to ${contact.email}`)
        
        // Populate email variables for this specific contact
        const emailVariables = await populateEmailVariables(
          member.id,
          contact.id,
          undefined, // eventId
          {
            contact_name: contact.name || contact.email,
            contact_email: contact.email
          }
        )

        console.log(`[Send Quick Email] Email variables populated for ${contact.name}`)

        // Replace variables in template subject and content
        const processedSubject = replaceEmailVariables(template.subject, emailVariables)
        const processedContent = replaceEmailVariables(template.body_html, emailVariables)

        console.log(`[Send Quick Email] Processed subject: "${processedSubject}"`)

        // Send email using Resend
        const emailResult = await sendEmail({
          to: contact.email,
          subject: processedSubject,
          html: processedContent,
          text: processedContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
          replyTo: member.email,
          useEdgeFunction: false
        })

        console.log(`[Send Quick Email] Email result for ${contact.email}:`, {
          success: emailResult.success,
          messageId: emailResult.messageId,
          error: emailResult.error
        })

        if (emailResult.success) {
          // Create communication record
          const communicationData = {
            member_id: member.id,
            contact_id: contact.id,
            type: 'email',
            subject: processedSubject,
            content: processedContent,
            status: 'sent',
            template_id: template.id,
            metadata: {
              recipient_email: contact.email,
              recipient_name: contact.name,
              recipient_type: 'contact',
              sender_name: member.first_name ? `${member.first_name} ${member.last_name || ''}`.trim() : member.email,
              direction: 'outbound',
              quick_action: true,
              target_audience: targetAudience,
              message_id: emailResult.messageId
            }
          }

          const { error: commError } = await supabase
            .from('communications')
            .insert([communicationData])

          if (commError) {
            console.error('[Send Quick Email] Communication record error:', commError)
            // Continue anyway since email was sent successfully
          }

          results.push({
            contactId: contact.id,
            contactName: contact.name,
            email: contact.email,
            status: 'sent',
            sentAt: new Date().toISOString(),
            messageId: emailResult.messageId
          })
        } else {
          results.push({
            contactId: contact.id,
            contactName: contact.name,
            email: contact.email,
            status: 'failed',
            error: emailResult.error || 'Email sending failed'
          })
        }
        
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

    const sentCount = results.filter(r => r.status === 'sent').length
    const failedCount = results.filter(r => r.status === 'failed').length
    
    console.log('[Send Quick Email] Sending complete. Results:', {
      sent: sentCount,
      failed: failedCount,
      total: results.length
    })

    return NextResponse.json({
      success: sentCount > 0,
      message: sentCount > 0 
        ? `Successfully sent ${sentCount} email(s)${failedCount > 0 ? ` (${failedCount} failed)` : ''}`
        : `Failed to send emails to all ${failedCount} recipients`,
      results,
      template: {
        id: template.id,
        name: template.name
      },
      stats: {
        sent: sentCount,
        failed: failedCount,
        total: results.length
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