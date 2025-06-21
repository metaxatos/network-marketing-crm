import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { memberId } = await request.json();
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get member details including language preference
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, name, language, sponsor_id')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Get the welcome template in member's language
    const { data: welcomeTemplate, error: templateError } = await supabase
      .from('system_email_templates')
      .select('id')
      .eq('trigger_event', 'member_welcome')
      .eq('language', member.language || 'en')
      .eq('is_active', true)
      .single();

    if (templateError || !welcomeTemplate) {
      console.error('Welcome template not found:', templateError);
      return NextResponse.json(
        { error: 'Welcome template not found' },
        { status: 404 }
      );
    }

    // Schedule welcome email (immediate)
    const { data: automation, error: automationError } = await supabase
      .from('email_automation_queue')
      .insert({
        member_id: memberId,
        system_template_id: welcomeTemplate.id,
        scheduled_for: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (automationError) {
      throw automationError;
    }

    // If member has a sponsor, trigger sponsor notification
    if (member.sponsor_id) {
      // Get sponsor details
      const { data: sponsor } = await supabase
        .from('members')
        .select('id, language')
        .eq('id', member.sponsor_id)
        .single();

      if (sponsor) {
        // Get sponsor notification template
        const { data: sponsorTemplate } = await supabase
          .from('system_email_templates')
          .select('id')
          .eq('trigger_event', 'sponsor_notification')
          .eq('language', sponsor.language || 'en')
          .eq('is_active', true)
          .single();

        if (sponsorTemplate) {
          // Schedule sponsor notification
          await supabase
            .from('email_automation_queue')
            .insert({
              member_id: sponsor.id,
              contact_id: memberId, // The new member
              system_template_id: sponsorTemplate.id,
              scheduled_for: new Date().toISOString(),
              status: 'pending'
            });
        }
      }
    }

    // Trigger the edge function to process immediately
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Call edge function (fire and forget)
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-email-automation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      automation: {
        id: automation.id,
        status: automation.status,
        scheduled_for: automation.scheduled_for
      }
    });
  } catch (error) {
    console.error('Welcome automation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger welcome automation' },
      { status: 500 }
    );
  }
} 