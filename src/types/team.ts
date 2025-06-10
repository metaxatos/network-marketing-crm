// Team visualization and management types

export interface TeamMember {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  position: 'left' | 'right' | null; // For binary plans
  level: number;
  depth: number; // Levels below current user
  
  // Performance metrics
  metrics: {
    directTeam: number;
    totalTeam: number;
    contactsThisMonth: number;
    emailsSent: number;
    trainingProgress: number;
  };
  
  // For tree structure
  children?: TeamMember[];
}

export interface TeamStats {
  directTeam: number;
  totalTeam: number;
  activeThisMonth: number;
  newThisWeek: number;
  teamGrowthRate: number; // Percentage
}

export interface TeamTreeNode {
  name: string;
  id: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar: string | null;
  depth: number;
  metrics: {
    directTeam: number;
    totalTeam: number;
    emailsSent: number;
    trainingProgress: number;
  };
  children?: TeamTreeNode[];
}

export interface TeamFilters {
  status?: 'active' | 'inactive' | 'suspended' | '';
  level?: string;
  searchTerm?: string;
}

export interface TeamMemberAction {
  type: 'message' | 'viewContacts' | 'viewActivity' | 'editProfile';
  member: TeamMember;
}

export type TeamView = 'tree' | 'list'; 