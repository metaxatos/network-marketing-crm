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

    // Get team members (users where current user is their sponsor or in their downline)
    // This is a simplified implementation - in a real app you'd need recursive queries for full downline
    const { data: directTeam, error: teamError } = await supabase
      .from('members')
      .select(`
        id,
        email,
        username,
        member_profiles(first_name, last_name)
      `)
      .eq('sponsor_id', user.id)
      .limit(50);

    if (teamError) {
      console.error('Error fetching team members:', teamError);
      return apiError('Failed to fetch team members', 500);
    }

    // Transform the data to match the expected format
    const teamMembers = (directTeam || []).map((member: any) => ({
      id: member.id,
      email: member.email,
      username: member.username,
      name: member.member_profiles?.first_name 
        ? `${member.member_profiles.first_name} ${member.member_profiles.last_name || ''}`.trim()
        : member.username
    }));

    return apiResponse({
      members: teamMembers,
      total: teamMembers.length
    }, 200, 'Team members retrieved successfully');

  } catch (error) {
    console.error('Team downline API error:', error);
    return apiError('Failed to fetch team members', 500);
  }
} 