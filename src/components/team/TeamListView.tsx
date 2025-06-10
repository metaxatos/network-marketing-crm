'use client';

import { TeamMember } from '@/types/team';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Users, 
  GitBranch, 
  Mail, 
  GraduationCap, 
  MessageCircle, 
  Phone, 
  Calendar,
  MoreHorizontal
} from 'lucide-react';

interface TeamListViewProps {
  data: TeamMember[];
  selectedMember: TeamMember | null;
  onMemberClick: (member: TeamMember) => void;
}

interface MemberCardProps {
  member: TeamMember;
  isSelected: boolean;
  onClick: (member: TeamMember) => void;
  level?: number;
}

const MemberCard = ({ member, isSelected, onClick, level = 0 }: MemberCardProps) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-action-green', text: 'Active' };
      case 'inactive':
        return { color: 'bg-text-light', text: 'Inactive' };
      case 'suspended':
        return { color: 'bg-red-500', text: 'Suspended' };
      default:
        return { color: 'bg-text-light', text: 'Unknown' };
    }
  };

  const statusInfo = getStatusInfo(member.status);
  const indentAmount = Math.min(level * 24, 96); // Max 4 levels of indentation

  return (
    <div 
      style={{ marginLeft: `${indentAmount}px` }}
      className="mb-3"
    >
      <div
        onClick={() => onClick(member)}
        className={`
          bg-white rounded-2xl border border-white/50 p-4 md:p-6 cursor-pointer transition-all duration-300
          hover:shadow-lg hover:-translate-y-1 shadow-md
          ${isSelected ? 'ring-2 ring-action-purple shadow-purple' : ''}
        `}
      >
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar with status */}
            <div className="relative">
              <Avatar
                src={member.avatar}
                alt={member.name}
                size="lg"
              />
              <div className={`
                absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusInfo.color}
              `} />
            </div>

            {/* Member details */}
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary font-display text-base">{member.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-text-light">Level {member.depth + 1}</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'active' 
                    ? 'bg-green-50 text-action-green' 
                    : member.status === 'inactive'
                    ? 'bg-gray-50 text-text-light'
                    : 'bg-red-50 text-red-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                  {statusInfo.text}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-text-secondary hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-text-secondary hover:bg-gray-50 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-action-teal bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-action-teal" />
              </div>
              <div className="text-lg font-bold text-text-primary">{member.metrics.directTeam}</div>
              <div className="text-xs text-text-light">Direct</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-action-green bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <GitBranch className="w-4 h-4 text-action-green" />
              </div>
              <div className="text-lg font-bold text-text-primary">{member.metrics.totalTeam}</div>
              <div className="text-xs text-text-light">Total</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-action-golden bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-4 h-4 text-action-golden" />
              </div>
              <div className="text-lg font-bold text-text-primary">
                {Math.round(member.metrics.trainingProgress * 100)}%
              </div>
              <div className="text-xs text-text-light">Training</div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left side - Member info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                src={member.avatar}
                alt={member.name}
                size="lg"
              />
              <div className={`
                absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusInfo.color}
              `} />
            </div>

            {/* Member details */}
            <div>
              <h3 className="font-semibold text-text-primary font-display text-base">{member.name}</h3>
              <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                <span>Level {member.depth + 1}</span>
                <span>•</span>
                <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                <span>•</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'active' 
                    ? 'bg-green-50 text-action-green' 
                    : member.status === 'inactive'
                    ? 'bg-gray-50 text-text-light'
                    : 'bg-red-50 text-red-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                  {statusInfo.text}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Metrics and Actions */}
          <div className="flex items-center gap-8">
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-action-teal mr-1" />
                  <span className="text-xl font-bold text-text-primary">{member.metrics.directTeam}</span>
                </div>
                <p className="text-xs text-text-light">Direct Team</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <GitBranch className="w-4 h-4 text-action-green mr-1" />
                  <span className="text-xl font-bold text-text-primary">{member.metrics.totalTeam}</span>
                </div>
                <p className="text-xs text-text-light">Total Team</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Mail className="w-4 h-4 text-action-coral mr-1" />
                  <span className="text-xl font-bold text-text-primary">{member.metrics.emailsSent}</span>
                </div>
                <p className="text-xs text-text-light">Emails Sent</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <GraduationCap className="w-4 h-4 text-action-golden mr-1" />
                  <span className="text-xl font-bold text-text-primary">
                    {Math.round(member.metrics.trainingProgress * 100)}%
                  </span>
                </div>
                <p className="text-xs text-text-light">Training</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-action-purple bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center text-action-purple transition-all duration-300">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-action-teal bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center text-action-teal transition-all duration-300">
                <Phone className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-text-secondary transition-all duration-300">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar for training (both mobile and desktop) */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-light mb-2">
            <span>Training Progress</span>
            <span>{Math.round(member.metrics.trainingProgress * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-action-golden to-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${member.metrics.trainingProgress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TeamListView = ({ data, selectedMember, onMemberClick }: TeamListViewProps) => {
  // Flatten the hierarchical data for list view
  const flattenMembers = (members: TeamMember[], level = 0): Array<{ member: TeamMember; level: number }> => {
    const result: Array<{ member: TeamMember; level: number }> = [];
    
    members.forEach(member => {
      result.push({ member, level });
      if (member.children && member.children.length > 0) {
        result.push(...flattenMembers(member.children, level + 1));
      }
    });
    
    return result;
  };

  const flatMembers = flattenMembers(data);

  if (!flatMembers.length) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-white/50">
        <div className="w-20 h-20 bg-gradient-to-br from-action-purple to-action-coral rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-3 font-display">No team members found</h3>
        <p className="text-text-secondary">Try adjusting your search or filters to find your team members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List header */}
      <div className="bg-white rounded-2xl border border-white/50 p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary font-display">
              Team Members
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              {flatMembers.length} {flatMembers.length === 1 ? 'member' : 'members'} in your network
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-action-green rounded-full"></div>
              <span className="text-text-secondary">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-text-light rounded-full"></div>
              <span className="text-text-secondary">Inactive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-text-secondary">Suspended</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member list */}
      <div className="space-y-3">
        {flatMembers.map(({ member, level }) => (
          <MemberCard
            key={member.id}
            member={member}
            level={level}
            isSelected={selectedMember?.id === member.id}
            onClick={onMemberClick}
          />
        ))}
      </div>
    </div>
  );
}; 