import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

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

      // Here you would integrate with your email service (Resend, SendGrid, etc.)
      // For now, we'll simulate sending and update status
      try {
        // TODO: Replace with actual email sending logic
        // await emailService.send({
        //   to: recipient.email,
        //   subject: emailSubject,
        //   html: emailContent,
        //   from: member.email
        // })

        // Update communication status to sent
        await supabase
          .from('communications')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString(),
            metadata: {
              ...communicationData.metadata,
              sent_via: 'api'
            }
          })
          .eq('id', communication.id)

        return { success: true, communicationId: communication.id, recipient: recipient.email }
      } catch (emailError) {
        console.error('[Email Send API] Email sending failed:', emailError)
        
        // Update communication status to failed
        await supabase
          .from('communications')
          .update({ 
            status: 'failed',
            metadata: {
              ...communicationData.metadata,
              error: emailError instanceof Error ? emailError.message : 'Unknown error'
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

    console.log(`[Email Send API] Email send completed: ${successful} successful, ${failed} failed`)

    return apiResponse({
      message: `Email sent to ${successful} of ${recipients.length} recipients`,
      results: {
        total: recipients.length,
        successful,
        failed
      },
      template_used: template ? template.name : null
    })

  } catch (error) {
    console.error('[Email Send API] Unexpected error:', error)
    return apiError('Internal server error during email send', 500)
  }
}
