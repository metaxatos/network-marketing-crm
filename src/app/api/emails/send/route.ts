import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createApiClient(req)
    const { templateId, contactIds, customSubject, customContent, to } = await req.json()

    console.log('[Email Send API] Processing email send request')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return apiError('Authentication required', 401)
    }

    // Get member data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, company_id, email, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (memberError || !member) {
      return apiError('Member profile not found', 404)
    }

    // Validate input
    if (!templateId && !customContent) {
      return apiError('Template ID or custom content is required', 400)
    }

    if (!contactIds?.length && !to?.length) {
      return apiError('Recipients are required', 400)
    }

    let template = null
    let emailSubject = customSubject || 'Email from ' + (member.first_name || member.email)
    let emailContent = customContent || ''

    // Get template if provided
    if (templateId) {
      const { data: templateData, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single()

      if (templateError || !templateData) {
        return apiError('Email template not found', 404)
      }

      template = templateData
      emailSubject = customSubject || template.subject
      emailContent = customContent || template.body_html
    }

    // Get contacts if contactIds provided
    let contacts: any[] = []
    if (contactIds?.length) {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, name, email')
        .in('id', contactIds)
        .eq('member_id', member.id)

      if (contactsError) {
        return apiError('Failed to fetch contacts', 500)
      }

      contacts = contactsData || []
    }

    // Combine recipients from contacts and direct emails
    const recipients = [
      ...contacts.map(c => ({ id: c.id, name: c.name, email: c.email, type: 'contact' })),
      ...(to || []).map((email: string) => ({ email, type: 'direct' }))
    ].filter(r => r.email)

    if (recipients.length === 0) {
      return apiError('No valid recipients found', 400)
    }

    console.log(`[Email Send API] Sending to ${recipients.length} recipients`)

    // Create communication records for each recipient (NEW: using communications table)
    const communicationPromises = recipients.map(async (recipient) => {
      // Insert communication record
      const communicationData = {
        member_id: member.id,
        contact_id: recipient.type === 'contact' ? recipient.id : null,
        type: 'email',
        direction: 'outbound',
        subject: emailSubject,
        content: emailContent,
        status: 'pending',
        metadata: {
          template_id: templateId || null,
          recipient_email: recipient.email,
          recipient_name: recipient.name || null,
          recipient_type: recipient.type,
          sender_name: member.first_name ? `${member.first_name} ${member.last_name || ''}`.trim() : member.email
        }
      }

      const { data: communication, error: commError } = await supabase
        .from('communications')
        .insert([communicationData])
        .select()
        .single()

      if (commError) {
        console.error('[Email Send API] Communication insert error:', commError)
        throw new Error(`Failed to create communication record: ${commError.message}`)
      }

      // Send email using Resend
      try {
        console.log(`[Email Send API] Sending email to ${recipient.email}`)
        
        const emailResult = await sendEmail({
          to: recipient.email,
          subject: emailSubject,
          html: emailContent,
          text: emailContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
          replyTo: member.email,
          useEdgeFunction: true // Use Supabase Edge Function for better reliability
        })

        if (emailResult.success) {
          // Update communication status to sent
          await supabase
            .from('communications')
            .update({ 
              status: 'sent', 
              sent_at: new Date().toISOString(),
              metadata: {
                ...communicationData.metadata,
                sent_via: 'resend',
                message_id: emailResult.messageId
              }
            })
            .eq('id', communication.id)

          console.log(`[Email Send API] Email sent successfully to ${recipient.email}, messageId: ${emailResult.messageId}`)
          return { success: true, communicationId: communication.id, recipient: recipient.email }
        } else {
          console.error(`[Email Send API] Email sending failed to ${recipient.email}:`, emailResult.error)
          throw new Error(emailResult.error || 'Email sending failed')
        }
      } catch (emailError) {
        console.error('[Email Send API] Email sending failed:', emailError)
        
        // Update communication status to failed
        await supabase
          .from('communications')
          .update({ 
            status: 'failed',
            metadata: {
              ...communicationData.metadata,
              error: emailError instanceof Error ? emailError.message : 'Unknown error',
              failed_at: new Date().toISOString()
            }
          })
          .eq('id', communication.id)

        return { success: false, error: emailError, recipient: recipient.email }
      }
    })

    // Execute all email sends
    const results = await Promise.allSettled(communicationPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length

    // Log detailed errors for debugging
    const failedResults = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
    failedResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[Email Send API] Promise rejected for recipient ${index}:`, result.reason)
      } else if (result.status === 'fulfilled' && !result.value.success) {
        console.error(`[Email Send API] Email failed for recipient ${index}:`, result.value.error)
      }
    })

    console.log(`[Email Send API] Email send completed: ${successful} successful, ${failed} failed`)

    return apiResponse({
      message: `Email sent to ${successful} of ${recipients.length} recipients`,
      results: {
        total: recipients.length,
        successful,
        failed,
        errors: failedResults.map(r => r.status === 'rejected' ? r.reason : (r.value as any)?.error)
      },
      template_used: template ? template.name : null
    })

  } catch (error) {
    console.error('[Email Send API] Unexpected error:', error)
    return apiError('Internal server error during email send', 500)
  }
}
