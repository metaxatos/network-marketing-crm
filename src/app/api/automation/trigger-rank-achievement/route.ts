import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { memberId, rankName, nextRankName } = await request.json();
    
    if (!memberId || !rankName) {
      return NextResponse.json(
        { error: 'Member ID and rank name are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get member details including language preference
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, name, language')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Get the rank achievement template in member's language
    const { data: achievementTemplate, error: templateError } = await supabase
      .from('system_email_templates')
      .select('id')
      .eq('trigger_event', 'rank_achievement')
      .eq('language', member.language || 'en')
      .eq('is_active', true)
      .single();

    if (templateError || !achievementTemplate) {
      console.error('Rank achievement template not found:', templateError);
      return NextResponse.json(
        { error: 'Rank achievement template not found' },
        { status: 404 }
      );
    }

    // Store rank details in metadata
    const metadata = {
      rank_name: rankName,
      next_rank_name: nextRankName || 'the next level',
      achievement_date: new Date().toLocaleDateString()
    };

    // Schedule rank achievement email (immediate)
    const { data: automation, error: automationError } = await supabase
      .from('email_automation_queue')
      .insert({
        member_id: memberId,
        system_template_id: achievementTemplate.id,
        scheduled_for: new Date().toISOString(),
        status: 'pending',
        metadata
      })
      .select()
      .single();

    if (automationError) {
      throw automationError;
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
    console.error('Rank achievement automation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger rank achievement automation' },
      { status: 500 }
    );
  }
} 