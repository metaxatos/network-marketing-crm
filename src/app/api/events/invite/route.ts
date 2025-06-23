import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/api-helpers';
import { sendEmail } from '@/lib/email';
import { populateEmailVariables, replaceEmailVariables } from '@/lib/email-variables';

// Email template IDs as provided by the user
const EMAIL_TEMPLATES = {
  presentation: {
    opportunity: {
      live: {
        en: '4ca32706-59d2-47fe-8fb0-de7e3f6fbc15',
        gr: '2cca8a5b-a2f4-4236-a953-3dcf1598c986'
      },
      online: {
        en: 'ad7cbaf8-d6cf-425d-bf3d-25e21087cb18',
        gr: 'e4ddd266-36d1-47dc-88f5-5d4aab684f09'
      }
    },
    product: {
      live: {
        en: '4ca32706-59d2-47fe-8fb0-de7e3f6fbc15',
        gr: '2cca8a5b-a2f4-4236-a953-3dcf1598c986'
      },
      online: {
        en: 'ad7cbaf8-d6cf-425d-bf3d-25e21087cb18',
        gr: 'e4ddd266-36d1-47dc-88f5-5d4aab684f09'
      }
    }
  },
  training: {
    en: '29136692-427c-4013-af4c-3dcd6768b7fc',
    gr: '7c320974-7552-4e0c-8cd1-8dd3d47728de'
  }
};

interface InviteRecipient {
  id: string;
  email: string;
  name: string;
  type: 'contact' | 'team' | 'new';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, recipients, language = 'en', templateId } = body;

    if (!eventId || !recipients || !Array.isArray(recipients)) {
      return apiError('Missing required fields', 400);
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return apiError('Authentication required', 401);
    }

    // Extract base event ID (remove _occ1, _occ2 suffixes for recurring events)
    const baseEventId = eventId.replace(/_occ[12]$/, '');
    console.log('Event ID processing:', { originalEventId: eventId, baseEventId });
    
    // Get event details to verify ownership and get event info
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', baseEventId)
      .eq('member_id', user.id)
      .single();

    if (eventError || !event) {
      console.error('Event lookup failed:', { eventError, baseEventId, userId: user.id });
      return apiError(`Event not found or access denied: ${eventError?.message || 'No event found'}`, 404);
    }

    console.log('Event found:', { eventId: event.id, title: event.title, type: event.event_type });

    // Get member details for sender info
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, username, first_name, last_name, name')
      .eq('id', user.id)
      .single();

    if (memberError || !member) {
      return apiError('Member profile not found', 404);
    }

    const senderName = member.first_name 
      ? `${member.first_name} ${member.last_name || ''}`.trim()
      : (member.name || member.username);

         // Determine email template
     let finalTemplateId = templateId;
     if (!finalTemplateId) {
       const isTraining = event.event_type === 'training_workshop';
       const isOnline = event.format === 'online';
       const lang = language as 'en' | 'gr';
       
       if (isTraining) {
         finalTemplateId = EMAIL_TEMPLATES.training[lang];
       } else {
         const presentationType = event.event_type === 'opportunity_presentation' ? 'opportunity' : 'product';
         const formatType = isOnline ? 'online' : 'live';
         finalTemplateId = EMAIL_TEMPLATES.presentation[presentationType][formatType][lang];
       }
     }

    // Process recipients and send invitations
    const invitationResults = [];

    for (const recipient of recipients as InviteRecipient[]) {
      try {
        // Debug: Log the data we're trying to insert
        const insertData = {
          event_id: baseEventId, // Use base event ID for database
          sent_by: user.id,
          sent_to_type: recipient.type,
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          email_template_id: finalTemplateId,
          language: language,
          sent_at: new Date().toISOString()
        };
        console.log('Attempting to insert invitation:', insertData);

        // Create invitation record
        const { data: invitation, error: inviteError } = await supabase
          .from('event_invitations')
          .insert(insertData)
          .select()
          .single();

        if (inviteError) {
          console.error('Failed to create invitation record:', {
            error: inviteError,
            eventId: baseEventId,
            userId: user.id,
            recipientType: recipient.type,
            recipientEmail: recipient.email,
            templateId: finalTemplateId
          });
          invitationResults.push({
            email: recipient.email,
            status: 'failed',
            error: `Database error: ${inviteError.message || inviteError.code || 'Unknown error'}`
          });
          continue;
        }

        // Get email template content from database
        let emailSubject = `Invitation: ${event.title}`;
        let emailContent = `
          <h2>You're Invited to ${event.title}</h2>
          <p>Hello ${recipient.name},</p>
          <p>You've been invited by ${senderName} to join this event:</p>
          
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f9fafb;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">${event.title}</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Date:</strong> ${new Date(event.start_time).toLocaleString()}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Location:</strong> ${event.location_name || 'Online'}</p>
            ${event.description ? `<p style="margin: 10px 0 0 0; color: #374151;">${event.description}</p>` : ''}
          </div>
          
          <p>We hope to see you there!</p>
          <p>Best regards,<br>${senderName}</p>
        `;

        // If we have a template ID, try to get the template content
        if (finalTemplateId) {
          try {
            const { data: template } = await supabase
              .from('email_templates')
              .select('subject, body_html')
              .eq('id', finalTemplateId)
              .eq('is_active', true)
              .single();
            
            if (template) {
              emailSubject = template.subject || emailSubject;
              emailContent = template.body_html || emailContent;
              
              // Use proper email variable population and replacement
              const emailVariables = await populateEmailVariables(
                user.id,
                recipient.type === 'contact' ? recipient.id : undefined,
                baseEventId, // Pass event ID for event-specific variables
                {
                  // Override recipient information
                  contact_name: recipient.name,
                  contact_email: recipient.email,
                  recipient_name: recipient.name,
                  sender_name: senderName,
                  // Event specific overrides
                  event_title: event.title,
                  event_description: event.description || '',
                  event_date: new Date(event.start_time).toLocaleString(),
                  event_time: new Date(event.start_time).toLocaleTimeString(),
                  event_location: event.location_name || 'Online',
                  event_url: event.meeting_url || '',
                  register_url: `https://ourteam.gr/events/${eventId}/register`
                }
              );

              console.log(`[Event Invite] Email variables populated for ${recipient.email}:`, Object.keys(emailVariables));

              // Replace variables in subject and content
              emailSubject = replaceEmailVariables(emailSubject, emailVariables);
              emailContent = replaceEmailVariables(emailContent, emailVariables);
            }
          } catch (templateError) {
            console.warn('Could not fetch email template, using default:', templateError);
          }
        }

        // Send email directly using the email library
        const emailResult = await sendEmail({
          to: recipient.email,
          subject: emailSubject,
          html: emailContent,
          replyTo: member.email,
          useEdgeFunction: false
        });

        if (emailResult.success) {
          invitationResults.push({
            email: recipient.email,
            status: 'sent',
            invitationId: invitation.id
          });
        } else {
          console.error('Failed to send email to:', recipient.email, 'Error:', emailResult.error);
          invitationResults.push({
            email: recipient.email,
            status: 'failed',
            error: `Email sending failed: ${emailResult.error || 'Unknown error'}`
          });
        }

      } catch (error) {
        console.error('Error processing recipient:', recipient.email, error);
        invitationResults.push({
          email: recipient.email,
          status: 'failed',
          error: 'Processing error'
        });
      }
    }

    // Summary
    const successful = invitationResults.filter(r => r.status === 'sent').length;
    const failed = invitationResults.filter(r => r.status === 'failed').length;

    return apiResponse({
      success: true,
      summary: {
        total: recipients.length,
        sent: successful,
        failed: failed
      },
      results: invitationResults,
      eventId: eventId,
      templateId: finalTemplateId
    }, 200, `Sent ${successful} invitation${successful !== 1 ? 's' : ''}`);

  } catch (error) {
    console.error('Event invitation API error:', error);
    return apiError('Failed to send invitations', 500);
  }
} 