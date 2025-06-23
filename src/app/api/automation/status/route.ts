import { createApiClient } from '@/lib/supabase/api-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const supabase = await createApiClient(request);
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Build query
    let query = supabase
      .from('email_automation_queue')
      .select(`
        *,
        contacts:contact_id(id, name, email),
        system_email_templates:system_template_id(id, name, subject)
      `)
      .eq('member_id', user.id)
      .order('scheduled_for', { ascending: true })
      .limit(limit);
    
    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data: automations, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Get summary stats
    const { data: stats, error: statsError } = await supabase
      .from('email_automation_queue')
      .select('status')
      .eq('member_id', user.id);
    
    if (statsError) {
      throw statsError;
    }
    
    const summary = {
      total: stats?.length || 0,
      pending: stats?.filter(s => s.status === 'pending').length || 0,
      sent: stats?.filter(s => s.status === 'sent').length || 0,
      failed: stats?.filter(s => s.status === 'failed').length || 0,
      cancelled: stats?.filter(s => s.status === 'cancelled').length || 0
    };
    
    return NextResponse.json({
      success: true,
      data: {
        automations,
        summary
      }
    });
    
  } catch (error) {
    console.error('Error fetching automation status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch automation status' 
      },
      { status: 500 }
    );
  }
}