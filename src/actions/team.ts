'use server';

import { createClient } from '@/lib/supabase/server';
import { TeamMember, TeamStats } from '@/types/team';

// Mock data for testing - replace with real database calls later
const mockTeamData: TeamMember[] = [
  {
    id: 'user-1',
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    avatar: null,
    status: 'active',
    joinDate: '2024-01-15T00:00:00Z',
    position: null,
    level: 1,
    depth: 0,
    metrics: {
      directTeam: 3,
      totalTeam: 8,
      contactsThisMonth: 15,
      emailsSent: 12,
      trainingProgress: 0.85
    },
    children: [
      {
        id: 'user-2',
        name: 'Sarah Johnson',
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: null,
        status: 'active',
        joinDate: '2024-02-01T00:00:00Z',
        position: 'left',
        level: 2,
        depth: 1,
        metrics: {
          directTeam: 2,
          totalTeam: 3,
          contactsThisMonth: 8,
          emailsSent: 6,
          trainingProgress: 0.65
        },
        children: [
          {
            id: 'user-4',
            name: 'Mike Wilson',
            firstName: 'Mike',
            lastName: 'Wilson',
            avatar: null,
            status: 'active',
            joinDate: '2024-03-10T00:00:00Z',
            position: 'left',
            level: 3,
            depth: 2,
            metrics: {
              directTeam: 0,
              totalTeam: 0,
              contactsThisMonth: 3,
              emailsSent: 2,
              trainingProgress: 0.25
            },
            children: []
          },
          {
            id: 'user-5',
            name: 'Lisa Brown',
            firstName: 'Lisa',
            lastName: 'Brown',
            avatar: null,
            status: 'inactive',
            joinDate: '2024-03-15T00:00:00Z',
            position: 'right',
            level: 3,
            depth: 2,
            metrics: {
              directTeam: 0,
              totalTeam: 0,
              contactsThisMonth: 1,
              emailsSent: 0,
              trainingProgress: 0.10
            },
            children: []
          }
        ]
      },
      {
        id: 'user-3',
        name: 'David Lee',
        firstName: 'David',
        lastName: 'Lee',
        avatar: null,
        status: 'active',
        joinDate: '2024-02-15T00:00:00Z',
        position: 'right',
        level: 2,
        depth: 1,
        metrics: {
          directTeam: 1,
          totalTeam: 2,
          contactsThisMonth: 12,
          emailsSent: 8,
          trainingProgress: 0.75
        },
        children: [
          {
            id: 'user-6',
            name: 'Emma Davis',
            firstName: 'Emma',
            lastName: 'Davis',
            avatar: null,
            status: 'active',
            joinDate: '2024-03-20T00:00:00Z',
            position: 'left',
            level: 3,
            depth: 2,
            metrics: {
              directTeam: 0,
              totalTeam: 0,
              contactsThisMonth: 5,
              emailsSent: 4,
              trainingProgress: 0.40
            },
            children: []
          }
        ]
      },
      {
        id: 'user-7',
        name: 'Robert Taylor',
        firstName: 'Robert',
        lastName: 'Taylor',
        avatar: null,
        status: 'suspended',
        joinDate: '2024-01-30T00:00:00Z',
        position: null,
        level: 2,
        depth: 1,
        metrics: {
          directTeam: 0,
          totalTeam: 0,
          contactsThisMonth: 0,
          emailsSent: 0,
          trainingProgress: 0.05
        },
        children: []
      }
    ]
  }
];

const mockTeamStats: TeamStats = {
  directTeam: 3,
  totalTeam: 8,
  activeThisMonth: 5,
  newThisWeek: 2,
  teamGrowthRate: 15
};

export async function getTeamHierarchy(memberId: string): Promise<TeamMember[]> {
  // For now, return mock data
  // TODO: Replace with actual database query
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockTeamData;

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
  // For now, return mock data
  // TODO: Replace with actual database query
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockTeamStats;

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