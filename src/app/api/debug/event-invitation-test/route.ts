import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiResponse, apiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return apiError('Authentication required', 401);
    }

    // Test 1: Check if event_invitations table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('event_invitations')
      .select('*')
      .limit(1);

    // Test 2: Get user's member record
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', user.id)
      .single();

    // Test 3: Get user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, event_type, format')
      .eq('member_id', user.id)
      .limit(5);

    // Test 4: Try a simple insert (then delete it)
    const testInsert = {
      event_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
      sent_by: user.id,
      sent_to_type: 'contact',
      recipient_email: 'test@example.com',
      recipient_name: 'Test User',
      language: 'en'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('event_invitations')
      .insert(testInsert)
      .select()
      .single();

    // Clean up the test record if it was created
    if (insertResult) {
      await supabase
        .from('event_invitations')
        .delete()
        .eq('id', insertResult.id);
    }

    return apiResponse({
      user: {
        id: user.id,
        email: user.email
      },
      tests: {
        tableExists: !tableError,
        tableError: tableError?.message,
        memberRecord: !!member,
        memberError: memberError?.message,
        eventsCount: events?.length || 0,
        eventsError: eventsError?.message,
        insertTest: {
          success: !!insertResult,
          error: insertError?.message,
          data: insertResult
        }
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return apiError('Debug test failed', 500);
  }
} 