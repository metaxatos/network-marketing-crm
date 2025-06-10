'use client';

import { TeamMember } from '@/types/team';

interface MemberDetailsSidebarProps {
  member: TeamMember;
  onClose: () => void;
  onAction: (action: string, member: TeamMember) => void;
}

interface ProgressBarProps {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const ProgressBar = ({ label, value, color }: ProgressBarProps) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>{label}</span>
        <span className="font-semibold">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
};

interface MetricRowProps {
  label: string;
  value: number | string;
  icon: string;
}

const MetricRow = ({ label, value, icon }: MetricRowProps) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <span className="text-gray-600">{label}</span>
    </div>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const MemberDetailsSidebar = ({ member, onClose, onAction }: MemberDetailsSidebarProps) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅', text: 'Active' };
      case 'inactive':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏸️', text: 'Inactive' };
      case 'suspended':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: '🚫', text: 'Suspended' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '❓', text: 'Unknown' };
    }
  };

  const statusInfo = getStatusInfo(member.status);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={member.avatar || '/api/placeholder/64/64'} 
                  className="w-16 h-16 rounded-full object-cover"
                  alt={member.name}
                />
                <div className={`
                  absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white
                  ${member.status === 'active' ? 'bg-green-500' : 
                    member.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'}
                `} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
                <p className="text-sm text-gray-600">
                  Joined {formatDate(member.joinDate)}
                </p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border mt-1 ${statusInfo.color}`}>
                  {statusInfo.icon} {statusInfo.text}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Performance Overview */}
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>📊</span>
            Performance Overview
          </h3>
          <div className="space-y-4">
            <ProgressBar 
              label="Training Progress" 
              value={member.metrics.trainingProgress * 100} 
              color="blue"
            />
            <MetricRow 
              label="Contacts This Month" 
              value={member.metrics.contactsThisMonth}
              icon="📱"
            />
            <MetricRow 
              label="Emails Sent" 
              value={member.metrics.emailsSent}
              icon="✉️"
            />
          </div>
        </div>
        
        {/* Team Structure */}
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>🌳</span>
            Team Structure
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">Direct Team</p>
              <p className="text-3xl font-bold text-blue-900">{member.metrics.directTeam}</p>
              <p className="text-xs text-blue-600">Personal recruits</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">Total Team</p>
              <p className="text-3xl font-bold text-green-900">{member.metrics.totalTeam}</p>
              <p className="text-xs text-green-600">Entire downline</p>
            </div>
          </div>
          
          {/* Level info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Organization Level</span>
              <span className="font-semibold text-gray-900">Level {member.depth + 1}</span>
            </div>
            {member.position && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">Position</span>
                <span className="font-semibold text-gray-900 capitalize">{member.position}</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>⚡</span>
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-600">📧</span>
                <span className="text-sm font-medium text-blue-900">Email Activity</span>
              </div>
              <p className="text-xs text-blue-700">
                Sent {member.metrics.emailsSent} emails this month
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-purple-600">📚</span>
                <span className="text-sm font-medium text-purple-900">Training Status</span>
              </div>
              <p className="text-xs text-purple-700">
                {Math.round(member.metrics.trainingProgress * 100)}% completed
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>🚀</span>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => onAction('message', member)}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>💬</span>
              Send Message
            </button>
            <button 
              onClick={() => onAction('viewContacts', member)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>👥</span>
              View Contacts
            </button>
            <button 
              onClick={() => onAction('viewActivity', member)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>📊</span>
              View Activity
            </button>
          </div>
        </div>
      </div>
    </>
  );
}; 