'use client';

import { useMemo } from 'react';
import Tree from 'react-d3-tree';
import { TeamMember, TeamTreeNode } from '@/types/team';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Users, 
  GitBranch, 
  Mail, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp,
  MoreHorizontal,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface TeamTreeViewProps {
  data: TeamMember[];
  selectedMember: TeamMember | null;
  onNodeClick: (member: TeamMember) => void;
}

export const TeamTreeView = ({ data, selectedMember, onNodeClick }: TeamTreeViewProps) => {
  // Transform TeamMember data to react-d3-tree format
  const treeData = useMemo(() => {
    const transformToTreeData = (members: TeamMember[]): TeamTreeNode[] => {
      return members.map(member => ({
        name: member.name,
        id: member.id,
        status: member.status,
        avatar: member.avatar,
        depth: member.depth,
        joinDate: member.joinDate,
        metrics: {
          directTeam: member.metrics.directTeam,
          totalTeam: member.metrics.totalTeam,
          emailsSent: member.metrics.emailsSent,
          trainingProgress: member.metrics.trainingProgress
        },
        children: member.children ? transformToTreeData(member.children) : undefined
      }));
    };

    return transformToTreeData(data);
  }, [data]);

  // Custom node rendering component
  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const member = findMemberById(data, nodeDatum.id);
    const isSelected = selectedMember?.id === nodeDatum.id;
    const isRoot = nodeDatum.depth === 0;
    
    return (
      <g>
        {/* Member card */}
        <foreignObject width={240} height={140} x={-120} y={-70}>
          <div 
            className={`
              bg-white rounded-2xl shadow-md p-4 cursor-pointer border border-white/50
              transition-all duration-300 hover:shadow-lg hover:-translate-y-1
              ${getStatusShadow(nodeDatum.status)}
              ${isSelected ? 'ring-2 ring-action-purple shadow-purple' : ''}
              ${isRoot ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-action-purple border-2' : ''}
            `}
            onClick={() => member && onNodeClick(member)}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar 
                  src={nodeDatum.avatar} 
                  alt={nodeDatum.name}
                  size="md"
                />
                {/* Status indicator */}
                <div className={`
                  absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                  ${getStatusIndicatorColor(nodeDatum.status)}
                `} />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-text-primary font-display truncate">
                  {nodeDatum.name}
                </p>
                <p className="text-xs text-text-light">
                  Level {nodeDatum.depth + 1}
                  {isRoot && <span className=" • Team Leader"></span>}
                </p>
                <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                  nodeDatum.status === 'active' 
                    ? 'bg-green-50 text-action-green' 
                    : nodeDatum.status === 'inactive'
                    ? 'bg-gray-50 text-text-light'
                    : 'bg-red-50 text-red-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${getStatusIndicatorColor(nodeDatum.status)}`} />
                  {getStatusText(nodeDatum.status)}
                </div>
              </div>
            </div>
            
            {/* Mini metrics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-3 h-3 text-action-teal mr-1" />
                  <span className="text-sm font-bold text-text-primary">{nodeDatum.metrics.directTeam}</span>
                </div>
                <span className="text-xs text-text-light">Direct</span>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <GitBranch className="w-3 h-3 text-action-green mr-1" />
                  <span className="text-sm font-bold text-text-primary">{nodeDatum.metrics.totalTeam}</span>
                </div>
                <span className="text-xs text-text-light">Total</span>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Mail className="w-3 h-3 text-action-coral mr-1" />
                  <span className="text-sm font-bold text-text-primary">{nodeDatum.metrics.emailsSent}</span>
                </div>
                <span className="text-xs text-text-light">Emails</span>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <GraduationCap className="w-3 h-3 text-action-golden mr-1" />
                  <span className="text-sm font-bold text-text-primary">
                    {Math.round(nodeDatum.metrics.trainingProgress * 100)}%
                  </span>
                </div>
                <span className="text-xs text-text-light">Training</span>
              </div>
            </div>
          </div>
        </foreignObject>
        
        {/* Expand/collapse indicator */}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <foreignObject width={24} height={24} x={-12} y={85}>
            <button
              onClick={toggleNode}
              className="w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-action-purple hover:bg-purple-50 transition-all duration-300 shadow-sm"
            >
              {nodeDatum.__rd3t?.collapsed ? (
                <ChevronDown className="w-3 h-3 text-text-secondary" />
              ) : (
                <ChevronUp className="w-3 h-3 text-text-secondary" />
              )}
            </button>
          </foreignObject>
        )}
      </g>
    );
  };

  // Helper function to get status shadow
  const getStatusShadow = (status: string) => {
    switch (status) {
      case 'active':
        return 'shadow-green';
      case 'inactive':
        return 'shadow-md';
      case 'suspended':
        return 'shadow-md';
      default:
        return 'shadow-md';
    }
  };

  // Helper function to get status indicator color
  const getStatusIndicatorColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-action-green';
      case 'inactive':
        return 'bg-text-light';
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-text-light';
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Unknown';
    }
  };

  // Helper function to find member by ID in nested structure
  const findMemberById = (members: TeamMember[], id: string): TeamMember | null => {
    for (const member of members) {
      if (member.id === id) return member;
      if (member.children) {
        const found = findMemberById(member.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  if (!treeData.length) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-white/50">
        <div className="w-20 h-20 bg-gradient-to-br from-action-purple to-action-coral rounded-full flex items-center justify-center mx-auto mb-6">
          <GitBranch className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-3 font-display">No team structure found</h3>
        <p className="text-text-secondary">Try adjusting your search or filters to view your team hierarchy.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Notice */}
      <div className="md:hidden bg-white rounded-2xl shadow-md p-6 text-center border border-white/50 mb-6">
        <div className="w-12 h-12 bg-action-purple bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <GitBranch className="w-6 h-6 text-action-purple" />
        </div>
        <h3 className="font-semibold text-text-primary mb-2 font-display">Tree View</h3>
        <p className="text-sm text-text-secondary mb-4">
          The team tree view is optimized for desktop. Switch to list view for a better mobile experience.
        </p>
        <button className="btn-secondary text-sm">
          Switch to List View
        </button>
      </div>

      {/* Desktop Tree View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden border border-white/50">
        {/* Tree Controls */}
        <div className="bg-gray-50 border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary font-display">Team Hierarchy</h3>
              <p className="text-sm text-text-secondary">Interactive organizational structure</p>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">
                <Maximize2 className="w-4 h-4" />
                Expand All
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">
                <Minimize2 className="w-4 h-4" />
                Collapse All
              </button>
            </div>
          </div>
        </div>
        
        {/* Tree Container */}
        <div className="h-[600px] w-full bg-gradient-to-br from-gray-50 to-purple-50">
          <Tree
            data={treeData}
            orientation="vertical"
            translate={{ x: 400, y: 100 }}
            nodeSize={{ x: 300, y: 200 }}
            separation={{ siblings: 1.2, nonSiblings: 1.5 }}
            pathFunc="step"
            renderCustomNodeElement={renderCustomNode}
            zoom={0.8}
            enableLegacyTransitions={true}
            transitionDuration={400}
            collapsible={true}
            initialDepth={3}
            pathClassFunc={() => 'stroke-action-purple stroke-2 fill-none opacity-60'}
            scaleExtent={{ min: 0.3, max: 2 }}
            shouldCollapseNeighborNodes={false}
          />
        </div>
      </div>
    </>
  );
}; 