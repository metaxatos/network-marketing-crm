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
    const { memberId, rankName, achievementDate, nextRankName } = body

    // Use provided memberId or current user
    const targetMemberId = memberId || user.id

    if (!rankName) {
      return NextResponse.json({ error: 'Rank name is required' }, { status: 400 })
    }

    // Get member data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, company_id, email, first_name, last_name, name, sponsor_id')
      .eq('id', targetMemberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 })
    }

    // Get rank achievement email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'Rank Achievement')
      .eq('company_id', member.company_id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Rank achievement email template not found' }, { status: 404 })
    }

    // Get sponsor if available
    let sponsor = null
    if (member.sponsor_id) {
      const { data: sponsorData } = await supabase
        .from('members')
        .select('id, name, email, first_name, last_name')
        .eq('id', member.sponsor_id)
        .single()
      
      sponsor = sponsorData
    }

    // Get member's display name and email for from/reply-to
    const memberDisplayName = await getMemberDisplayName(targetMemberId)
    const memberReplyToEmail = await getMemberEmail(targetMemberId)

    // Populate email variables with rank achievement info
    const customVariables = {
      // Set member/sender info
      member_name: memberDisplayName,
      sender_name: memberDisplayName,
      
      // Rank achievement variables
      rank_name: rankName,
      achievement_date: achievementDate || new Date().toLocaleDateString(),
      next_rank_name: nextRankName || '',
      
      // Contact info (member is receiving their own achievement email)
      contact_name: member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim(),
      first_name: member.first_name || (member.name ? member.name.split(' ')[0] : ''),
      contact_email: member.email
    }

    const emailVariables = await populateEmailVariables(
      targetMemberId,
      undefined, // contactId (member is receiving their own email)
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
        contact_id: null, // Member is receiving their own achievement email
        type: 'email',
        subject: processedSubject,
        content: processedContent,
        status: 'sent',
        template_id: template.id,
        metadata: {
          recipient_email: member.email,
          recipient_name: member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim(),
          recipient_type: 'member',
          sender_name: memberDisplayName,
          direction: 'outbound',
          automation_trigger: 'rank_achievement',
          rank_name: rankName,
          achievement_date: achievementDate
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
      to: member.email,
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

      // Also send notification to sponsor if available
      let sponsorNotification = null
      if (sponsor) {
        try {
          // Get sponsor notification template
          const { data: sponsorTemplate } = await supabase
            .from('email_templates')
            .select('*')
            .eq('name', 'Sponsor Notification - Rank Achievement')
            .eq('company_id', member.company_id)
            .single()

          if (sponsorTemplate) {
            const sponsorVariables = {
              ...emailVariables,
              contact_name: sponsor.name || `${sponsor.first_name || ''} ${sponsor.last_name || ''}`.trim(),
              first_name: sponsor.first_name || (sponsor.name ? sponsor.name.split(' ')[0] : ''),
              contact_email: sponsor.email,
              new_member_name: member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim()
            }

            const sponsorSubject = replaceEmailVariables(sponsorTemplate.subject, sponsorVariables)
            const sponsorContent = replaceEmailVariables(sponsorTemplate.body_html, sponsorVariables)

            const sponsorEmailResult = await sendEmail({
              to: sponsor.email,
              subject: sponsorSubject,
              html: sponsorContent,
              text: sponsorContent.replace(/<[^>]*>/g, ''),
              replyTo: memberReplyToEmail,
              fromName: memberDisplayName
            })

            sponsorNotification = {
              sent: sponsorEmailResult.success,
              messageId: sponsorEmailResult.messageId,
              error: sponsorEmailResult.error
            }
          }
        } catch (sponsorError) {
          console.error('Error sending sponsor notification:', sponsorError)
          sponsorNotification = {
            sent: false,
            error: 'Failed to send sponsor notification'
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Rank achievement email sent successfully',
        messageId: emailResult.messageId,
        communicationId: communication.id,
        sponsorNotification
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
        error: 'Failed to send rank achievement email',
        details: emailResult.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Unexpected error in trigger-rank-achievement:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}