import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody, getCurrentMember } from '@/lib/api-helpers'
import { sendEmail } from '@/lib/email'
import { wrapEmailLinks } from '@/lib/email-tracking'
import type { SendEmailRequest } from '@/types/api'

// POST /api/emails/send - Send email with template
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Validate request body
    const body = await validateBody<SendEmailRequest>(req, (data) => {
      if (!data.contactId || !data.templateId) {
        throw new Error('Contact ID and template ID are required')
      }

      return {
        contactId: data.contactId,
        templateId: data.templateId,
        variables: data.variables || {},
      }
    })

    // Get contact details
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, name, email')
      .eq('id', body.contactId)
      .eq('member_id', userId)
      .single()

    if (!contact || !contact.email) {
      return apiError('Contact not found or has no email address', 404)
    }

    // Get member details
    const member = await getCurrentMember(userId)
    
    if (!member?.company_id) {
      return apiError('Company not found', 404)
    }

    // Get email template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', body.templateId)
      .eq('company_id', member.company_id)
      .eq('is_active', true)
      .single()

    if (!template) {
      return apiError('Email template not found', 404)
    }

    // Prepare variables
    const variables = {
      contact_name: contact.name,
      sender_name: `${member.member_profiles?.[0]?.first_name || ''} ${member.member_profiles?.[0]?.last_name || ''}`.trim(),
      ...body.variables,
    }

    // Replace variables in subject and content
    let subject = template.subject
    let bodyHtml = template.body_html
    let bodyText = template.body_text

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{${key}}`, 'g')
      subject = subject.replace(placeholder, value)
      bodyHtml = bodyHtml.replace(placeholder, value)
      bodyText = bodyText.replace(placeholder, value)
    })

    // Create email record in database (pending status)
    const { data: emailRecord, error: emailError } = await supabase
      .from('sent_emails')
      .insert({
        member_id: userId,
        contact_id: body.contactId,
        template_id: body.templateId,
        subject,
        body_html: bodyHtml,
        status: 'pending',
      })
      .select()
      .single()

    if (emailError || !emailRecord) {
      throw new Error('Failed to create email record')
    }

    // Wrap all links with click tracking
    const trackingResult = wrapEmailLinks(
      bodyHtml,
      bodyText,
      emailRecord.id,
      body.contactId
    )

    // Send email with tracking
    const result = await sendEmail({
      to: contact.email,
      subject,
      html: addTrackingPixel(trackingResult.html, emailRecord.id),
      text: trackingResult.text,
    })

    // Update email status
    const finalStatus = result.success ? 'sent' : 'failed'
    await supabase
      .from('sent_emails')
      .update({
        status: finalStatus,
        sent_at: result.success ? new Date().toISOString() : null,
      })
      .eq('id', emailRecord.id)

    if (!result.success) {
      return apiError(`Failed to send email: ${result.error}`, 500)
    }

    // Update contact last contacted date
    await supabase
      .from('contacts')
      .update({
        last_contacted_at: new Date().toISOString(),
      })
      .eq('id', body.contactId)

    // Log interaction
    await supabase.from('contact_interactions').insert({
      contact_id: body.contactId,
      interaction_type: 'email_sent',
      metadata: {
        email_id: emailRecord.id,
        template_id: body.templateId,
        subject,
      },
    })

    // Log activity
    await supabase.from('member_activities').insert({
      member_id: userId,
      activity_type: 'email_sent',
      metadata: {
        contact_id: body.contactId,
        contact_name: contact.name,
        template_name: template.name,
      },
    })

    return apiResponse({
      email: {
        id: emailRecord.id,
        status: 'sent',
        sentAt: new Date().toISOString(),
      },
    }, 200, 'Email sent successfully')
  } catch (error) {
    console.error('Send email error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to send email',
      500
    )
  }
})

// Add tracking pixel to email HTML
function addTrackingPixel(html: string, emailId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const trackingPixel = `<img src="${baseUrl}/api/emails/track/${emailId}" width="1" height="1" style="display:none;" />`
  
  // Add before closing body tag if it exists, otherwise append
  if (html.includes('</body>')) {
    return html.replace('</body>', `${trackingPixel}</body>`)
  }
  return html + trackingPixel
} 