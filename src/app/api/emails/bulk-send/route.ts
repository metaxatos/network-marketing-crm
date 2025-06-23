import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { sendEmail } from '@/lib/email'
import { populateEmailVariables, replaceEmailVariables, getMemberDisplayName, getMemberEmail } from '@/lib/email-variables'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createApiClient(req)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { contactIds, templateId, customSubject, customContent } = body

    if (!contactIds || contactIds.length === 0) {
      return NextResponse.json({ error: 'Contact IDs are required' }, { status: 400 })
    }

    if (!templateId && !customContent) {
      return NextResponse.json({ error: 'Template ID or custom content is required' }, { status: 400 })
    }

    // Get member data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, company_id, email, first_name, last_name, name')
      .eq('id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 })
    }

    // Get member's display name and email for from/reply-to
    const memberDisplayName = await getMemberDisplayName(user.id)
    const memberReplyToEmail = await getMemberEmail(user.id)

    let template = null
    let emailSubject = customSubject || 'Email from ' + memberDisplayName
    let emailContent = customContent || ''

    // Get template if provided
    if (templateId) {
      const { data: templateData, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError || !templateData) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }

      template = templateData
      emailSubject = template.subject
      emailContent = template.body_html
    }

    // Get contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name, email')
      .in('id', contactIds)
      .eq('member_id', member.id)

    if (contactsError) {
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found' }, { status: 404 })
    }

    const results = []

    // Send email to each contact
    for (const contact of contacts) {
      try {
        // Populate email variables for this specific recipient
        const customVariables = {
          // Set member/sender info
          member_name: memberDisplayName,
          sender_name: memberDisplayName,
          
          // Handle contact name - extract first name from full name
          contact_name: contact.name || contact.email,
          first_name: contact.name ? contact.name.split(' ')[0] : contact.email.split('@')[0],
          
          // Set recipient email for unsubscribe links etc.
          contact_email: contact.email
        }

        const emailVariables = await populateEmailVariables(
          user.id,
          contact.id,
          undefined, // eventId
          customVariables
        )

        // Replace variables in subject and content
        const processedSubject = customSubject || replaceEmailVariables(emailSubject, emailVariables)
        const processedContent = customContent || replaceEmailVariables(emailContent, emailVariables)
        
        // Insert communication record
        const { data: communication, error: commError } = await supabase
          .from('communications')
          .insert({
            member_id: member.id,
            contact_id: contact.id,
            type: 'email',
            subject: processedSubject,
            content: processedContent,
            status: 'sent',
            template_id: templateId || null,
            metadata: {
              recipient_email: contact.email,
              recipient_name: contact.name || null,
              recipient_type: 'contact',
              sender_name: memberDisplayName,
              direction: 'outbound'
            }
          })
          .select()
          .single()

        if (commError) {
          console.error('Failed to create communication record:', commError)
          results.push({
            contactId: contact.id,
            email: contact.email,
            status: 'failed',
            error: 'Failed to create communication record'
          })
          continue
        }

        // Send email using Resend with proper from name and reply-to
        const emailResult = await sendEmail({
          to: contact.email,
          subject: processedSubject,
          html: processedContent,
          text: processedContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
          replyTo: memberReplyToEmail, // User's email for replies
          fromName: memberDisplayName, // User's name as sender
          useEdgeFunction: false
        })
        
        if (emailResult.success) {
          // Update communication record with success
          await supabase
            .from('communications')
            .update({
              status: 'sent',
              metadata: {
                ...communication.metadata,
                sent_via: 'resend',
                message_id: emailResult.messageId,
                variables_used: emailVariables
              }
            })
            .eq('id', communication.id)

          results.push({
            contactId: contact.id,
            email: contact.email,
            status: 'sent',
            messageId: emailResult.messageId
          })
        } else {
          // Update communication record with failure
          await supabase
            .from('communications')
            .update({
              status: 'failed',
              metadata: {
                ...communication.metadata,
                error: emailResult.error
              }
            })
            .eq('id', communication.id)

          results.push({
            contactId: contact.id,
            email: contact.email,
            status: 'failed',
            error: emailResult.error
          })
        }
      } catch (error) {
        console.error('Error sending email to', contact.email, ':', error)
        results.push({
          contactId: contact.id,
          email: contact.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length
    const failureCount = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Bulk email completed. ${successCount} sent, ${failureCount} failed.`,
      results,
      summary: {
        total: results.length,
        sent: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    console.error('Unexpected error in bulk-send:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}