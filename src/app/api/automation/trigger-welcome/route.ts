import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { sendEmail } from '@/lib/email'
import { populateEmailVariables, replaceEmailVariables, getMemberDisplayName, getMemberEmail } from '@/lib/email-variables'

export async function POST(req: NextRequest) {
  try {
    const supabase = createApiClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { contactId, memberId } = body

    // Use provided memberId or current user
    const targetMemberId = memberId || user.id

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
    }

    // Get member data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, company_id, email, first_name, last_name, name')
      .eq('id', targetMemberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 })
    }

    // Get contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, name, email')
      .eq('id', contactId)
      .eq('member_id', targetMemberId)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Get welcome email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'Welcome Email')
      .eq('company_id', member.company_id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Welcome email template not found' }, { status: 404 })
    }

    // Get member's display name and email for from/reply-to
    const memberDisplayName = await getMemberDisplayName(targetMemberId)
    const memberReplyToEmail = await getMemberEmail(targetMemberId)

    // Populate email variables
    const customVariables = {
      // Set member/sender info
      member_name: memberDisplayName,
      sender_name: memberDisplayName,
      
      // Handle contact name - extract first name from full name
      contact_name: contact.name || contact.email,
      first_name: contact.name ? contact.name.split(' ')[0] : contact.email.split('@')[0],
      
      // Set recipient email
      contact_email: contact.email
    }

    const emailVariables = await populateEmailVariables(
      targetMemberId,
      contact.id,
      undefined, // eventId
      customVariables
    )

    // Replace variables in subject and content
    const processedSubject = replaceEmailVariables(template.subject, emailVariables)
    const processedContent = replaceEmailVariables(template.body_html, emailVariables)
    
    // Insert communication record
    const { data: communication, error: commError } = await supabase
      .from('communications')
      .insert({
        member_id: targetMemberId,
        contact_id: contact.id,
        type: 'email',
        subject: processedSubject,
        content: processedContent,
        status: 'sent',
        template_id: template.id,
        metadata: {
          recipient_email: contact.email,
          recipient_name: contact.name || null,
          recipient_type: 'contact',
          sender_name: memberDisplayName,
          direction: 'outbound',
          automation_trigger: 'welcome'
        }
      })
      .select()
      .single()

    if (commError) {
      console.error('Failed to create communication record:', commError)
      return NextResponse.json({ error: 'Failed to create communication record' }, { status: 500 })
    }

    // Send email using Resend
    const emailResult = await sendEmail({
      to: contact.email,
      subject: processedSubject,
      html: processedContent,
      text: processedContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      replyTo: memberReplyToEmail,
      fromName: memberDisplayName,
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

      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully',
        messageId: emailResult.messageId,
        communicationId: communication.id
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

      return NextResponse.json({
        success: false,
        error: 'Failed to send welcome email',
        details: emailResult.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Unexpected error in trigger-welcome:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}