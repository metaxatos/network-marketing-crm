import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query
    let query = supabase
      .from('email_automation_queue')
      .select(`
        *,
        system_email_templates (
          name,
          trigger_event,
          language
        ),
        members!email_automation_queue_member_id_fkey (
          name,
          email
        ),
        contact:members!email_automation_queue_contact_id_fkey (
          name,
          email
        )
      `)
      .order('scheduled_for', { ascending: false })
      .limit(limit);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: automations, error } = await query;

    if (error) {
      throw error;
    }

    // Get summary statistics
    const { data: stats } = await supabase
      .from('email_automation_queue')
      .select('status')
      .in('status', ['pending', 'sent', 'failed']);

    const summary = {
      pending: 0,
      sent: 0,
      failed: 0,
      total: 0
    };

    if (stats) {
      stats.forEach(item => {
        summary[item.status as keyof typeof summary]++;
        summary.total++;
      });
    }

    return NextResponse.json({
      automations: automations || [],
      summary
    });
  } catch (error) {
    console.error('Automation status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get automation status' },
      { status: 500 }
    );
  }
} 