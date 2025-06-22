'use server';

import { createClient } from '@/lib/supabase/server';
import { TeamMember, TeamStats } from '@/types/team';



export async function getTeamHierarchy(memberId: string): Promise<TeamMember[]> {
  // TODO: Implement actual team hierarchy query when database schema is ready
  
  // For now, return empty array - no mock data
  return [];

  /* 
  // Real implementation would be:
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_team_hierarchy', {
    member_id: memberId
  });

  if (error) {
    console.error('Error fetching team hierarchy:', error);
    throw new Error('Failed to fetch team hierarchy');
  }

  return transformToHierarchy(data || []);
  */
}

export async function getTeamStats(memberId: string): Promise<TeamStats> {
  // TODO: Implement actual team stats query when database schema is ready
  
  // For now, return zero stats - no mock data
  return {
    directTeam: 0,
    totalTeam: 0,
    activeThisMonth: 0,
    newThisWeek: 0,
    teamGrowthRate: 0
  };

  /*
  // Real implementation would be:
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_team_stats', {
    member_id: memberId
  });

  if (error) {
    console.error('Error fetching team stats:', error);
    throw new Error('Failed to fetch team stats');
  }

  return data || {
    directTeam: 0,
    totalTeam: 0,
    activeThisMonth: 0,
    newThisWeek: 0,
    teamGrowthRate: 0
  };
  */
}

export async function getMemberPerformance(memberIds: string[]) {
  // Mock implementation
  return [];

  /*
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_member_performance', {
    member_ids: memberIds
  });

  if (error) {
    console.error('Error fetching member performance:', error);
    throw new Error('Failed to fetch member performance');
  }

  return data || [];
  */
}

// Transform flat hierarchy data into nested tree structure
function transformToHierarchy(flatData: any[]): TeamMember[] {
  const memberMap = new Map<string, TeamMember>();
  const rootMembers: TeamMember[] = [];

  // First pass: create all members
  flatData.forEach(row => {
    const member: TeamMember = {
      id: row.id,
      name: `${row.first_name} ${row.last_name}`.trim(),
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      avatar: row.avatar_url,
      status: row.status,
      joinDate: row.created_at,
      position: row.position,
      level: row.level,
      depth: row.depth,
      metrics: {
        directTeam: row.direct_team || 0,
        totalTeam: row.total_team || 0,
        contactsThisMonth: row.contacts_this_month || 0,
        emailsSent: row.emails_sent || 0,
        trainingProgress: row.training_progress || 0
      },
      children: []
    };
    memberMap.set(row.id, member);
  });

  // Second pass: build hierarchy
  flatData.forEach(row => {
    const member = memberMap.get(row.id);
    if (!member) return;

    if (row.sponsor_id && memberMap.has(row.sponsor_id)) {
      const sponsor = memberMap.get(row.sponsor_id)!;
      sponsor.children = sponsor.children || [];
      sponsor.children.push(member);
    } else {
      // This is a root member (current user)
      rootMembers.push(member);
    }
  });

  return rootMembers;
}

export async function searchTeamMembers(memberId: string, searchTerm: string, filters: any) {
  // Mock implementation
  return [];

  /*
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('search_team_members', {
    member_id: memberId,
    search_term: searchTerm,
    status_filter: filters.status,
    level_filter: filters.level
  });

  if (error) {
    console.error('Error searching team members:', error);
    throw new Error('Failed to search team members');
  }

  return data || [];
  */
} 