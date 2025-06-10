'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { TeamHeader } from '@/components/team/TeamHeader';
import { ViewControls } from '@/components/team/ViewControls';
import { TeamTreeView } from '@/components/team/TeamTreeView';
import { TeamListView } from '@/components/team/TeamListView';
import { MemberDetailsSidebar } from '@/components/team/MemberDetailsSidebar';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';
import { TeamSkeleton } from '@/components/team/TeamSkeleton';
import { getTeamHierarchy, getTeamStats } from '@/actions/team';
import { TeamMember, TeamStats, TeamView, TeamFilters } from '@/types/team';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [view, setView] = useState<TeamView>('tree');
  const [filters, setFilters] = useState<TeamFilters>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load team data
  useEffect(() => {
    const userId = user?.id || (process.env.NODE_ENV === 'development' ? 'dev-user-id' : null);
    if (!userId) return;

    const loadTeamData = async () => {
      try {
        setIsLoading(true);
        const [hierarchy, stats] = await Promise.all([
          getTeamHierarchy(userId),
          getTeamStats(userId)
        ]);
        
        setTeamData(hierarchy);
        setTeamStats(stats);
      } catch (error) {
        console.error('Error loading team data:', error);
        toast.error('Failed to load team data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, [user?.id]);

  // Filter team data based on search and filters
  const filteredTeamData = useMemo(() => {
    if (!teamData.length) return [];
    
    let filtered = [...teamData];
    
    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const filterBySearch = (members: TeamMember[]): TeamMember[] => {
        return members.filter(member => {
          const matchesName = member.name.toLowerCase().includes(searchTerm);
          const hasMatchingChild = member.children && 
            filterBySearch(member.children).length > 0;
          
          if (matchesName || hasMatchingChild) {
            return {
              ...member,
              children: member.children ? filterBySearch(member.children) : []
            };
          }
          return false;
        });
      };
      filtered = filterBySearch(filtered);
    }
    
    // Apply status filter
    if (filters.status) {
      const filterByStatus = (members: TeamMember[]): TeamMember[] => {
        return members.filter(member => {
          const matchesStatus = member.status === filters.status;
          const hasMatchingChild = member.children && 
            filterByStatus(member.children).length > 0;
          
          if (matchesStatus || hasMatchingChild) {
            return {
              ...member,
              children: member.children ? filterByStatus(member.children) : []
            };
          }
          return false;
        });
      };
      filtered = filterByStatus(filtered);
    }
    
    return filtered;
  }, [teamData, filters]);

  const handleNodeClick = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const handleFilter = (key: keyof TeamFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleMemberAction = (action: string, member: TeamMember) => {
    switch (action) {
      case 'message':
        toast.success(`Opening message to ${member.name}`);
        break;
      case 'viewContacts':
        toast.success(`Viewing contacts for ${member.name}`);
        break;
      case 'viewActivity':
        toast.success(`Viewing activity for ${member.name}`);
        break;
      default:
        break;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout user={user || undefined}>
        <TeamSkeleton />
      </DashboardLayout>
    );
  }

  // Show empty state if no team data
  if (!teamData.length) {
    return (
      <DashboardLayout user={user || undefined}>
        <div className="min-h-screen gradient-main">
          <TeamHeader stats={teamStats || {
            directTeam: 0,
            totalTeam: 0,
            activeThisMonth: 0,
            newThisWeek: 0,
            teamGrowthRate: 0
          }} />
          <EmptyTeamState />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user || undefined}>
      <div className="min-h-screen gradient-main">
        {/* Header with stats */}
        <TeamHeader stats={teamStats || {
          directTeam: 0,
          totalTeam: 0,
          activeThisMonth: 0,
          newThisWeek: 0,
          teamGrowthRate: 0
        }} />
        
        {/* View controls */}
        <ViewControls 
          view={view}
          onViewChange={setView}
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filters}
        />
        
        {/* Main content */}
        <div className="pb-6 md:pb-8">
          {view === 'tree' ? (
            <TeamTreeView 
              data={filteredTeamData}
              selectedMember={selectedMember}
              onNodeClick={handleNodeClick}
            />
          ) : (
            <TeamListView 
              data={filteredTeamData}
              selectedMember={selectedMember}
              onMemberClick={handleNodeClick}
            />
          )}
        </div>
        
        {/* Member details sidebar */}
        {selectedMember && (
          <MemberDetailsSidebar
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
            onAction={handleMemberAction}
          />
        )}
      </div>
    </DashboardLayout>
  );
} 