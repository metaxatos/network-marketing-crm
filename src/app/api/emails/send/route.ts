import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, withAuth, validateBody } from '@/lib/api-helpers'

interface SendEmailRequest {
  contactIds: string[]
  subject: string
  body: string
  templateId?: string
}

// POST /api/emails/send - Send emails to selected contacts
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createApiClient(req)
    
    // Validate request body
    const body = await validateBody<SendEmailRequest>(req, (data) => {
      if (!data.contactIds || data.contactIds.length === 0) {
        throw new Error('At least one contact is required')
      }

      if (!data.subject || !data.body) {
        throw new Error('Subject and body are required')
      }

      return {
        contactIds: data.contactIds,
        subject: data.subject,
        body: data.body,
        templateId: data.templateId,
      }
    })

    // Verify all contacts belong to the user
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, email, name')
      .eq('member_id', userId)
      .in('id', body.contactIds)

    if (contactsError) {
      throw contactsError
    }

    if (!contacts || contacts.length !== body.contactIds.length) {
      return apiError('Some contacts were not found or do not belong to you', 400)
    }

    // Create sent_emails records for each contact
    const sentEmails = contacts.map(contact => ({
      member_id: userId,
      contact_id: contact.id,
      template_id: body.templateId || null,
      subject: body.subject,
      body_html: body.body,
      status: 'sent',
      sent_at: new Date().toISOString(),
    }))

    const { data: emailRecords, error: emailError } = await supabase
      .from('sent_emails')
      .insert(sentEmails)
      .select()

    if (emailError) {
      throw emailError
    }

    // Log activity
    await supabase.from('member_activities').insert({
      member_id: userId,
      activity_type: 'email_sent',
      metadata: {
        email_count: contacts.length,
        subject: body.subject,
        template_id: body.templateId,
      },
    })

    // Update contacts' last_contacted_at
    await supabase
      .from('contacts')
      .update({ last_contacted_at: new Date().toISOString() })
      .in('id', body.contactIds)

    // In a real app, you would integrate with an email service here
    // For now, we're just recording the email as sent in the database

    return apiResponse({
      success: true,
      sentCount: emailRecords.length,
      emailIds: emailRecords.map(e => e.id),
    }, 200, 'Emails sent successfully')
    
  } catch (error) {
    console.error('Send email error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to send emails',
      400
    )
  }
})
