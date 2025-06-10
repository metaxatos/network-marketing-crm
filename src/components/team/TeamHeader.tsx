'use client';

import { TeamStats } from '@/types/team';
import { Users, GitBranch, Zap, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext: string;
  variant: 'purple' | 'green' | 'golden' | 'teal';
  change?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ icon, label, value, subtext, variant, change }: StatCardProps) => {
  const variantStyles = {
    purple: {
      icon: 'bg-action-purple',
      shadow: 'shadow-purple',
    },
    green: {
      icon: 'bg-action-green',
      shadow: 'shadow-green',
    },
    golden: {
      icon: 'bg-action-golden',
      shadow: 'shadow-golden',
    },
    teal: {
      icon: 'bg-action-teal',
      shadow: 'shadow-teal',
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-white/50 ${variantStyles[variant].shadow} relative`}>
      {/* Connection line for desktop */}
      <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200 last:hidden"></div>
      
      <div className="text-center">
        {/* Icon */}
        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${variantStyles[variant].icon} flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        
        {/* Value */}
        <div className="text-2xl font-bold text-text-primary mb-1">
          {value.toLocaleString()}
        </div>
        
        {/* Label */}
        <div className="text-sm font-medium text-text-secondary mb-2">
          {label}
        </div>
        
        {/* Change indicator */}
        {change && (
          <div className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full ${
            change.isPositive 
              ? 'bg-green-50 text-action-green' 
              : 'bg-red-50 text-red-500'
          }`}>
            {change.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change.isPositive ? '+' : ''}{change.value}%
          </div>
        )}
        
        {/* Subtext */}
        <div className="text-xs text-text-light mt-2">
          {subtext}
        </div>
      </div>
    </div>
  );
};

interface TeamHeaderProps {
  stats: TeamStats;
}

export const TeamHeader = ({ stats }: TeamHeaderProps) => {
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-br from-action-purple to-action-teal text-white p-6 -m-4 mb-6">
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-lg">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold font-display">Your Team</h1>
          <p className="text-sm opacity-90 mt-1">Building success together</p>
        </div>
        
        {/* Mobile Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white bg-opacity-15 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/20">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{stats.directTeam}</div>
            <div className="text-xs opacity-90">Direct Team</div>
          </div>
          
          <div className="bg-white bg-opacity-15 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/20">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <GitBranch className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{stats.totalTeam}</div>
            <div className="text-xs opacity-90">Total Team</div>
          </div>
          
          <div className="bg-white bg-opacity-15 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/20">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{stats.activeThisMonth}</div>
            <div className="text-xs opacity-90">Active</div>
          </div>
          
          <div className="bg-white bg-opacity-15 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/20">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{stats.newThisWeek}</div>
            <div className="text-xs opacity-90">New</div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block mb-8">
        {/* Page Title */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-8 border border-white/50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-text-primary font-display mb-1">Your Team</h1>
              <p className="text-text-secondary">Manage and grow your network</p>
            </div>
            
            <div className="flex gap-3">
              <button className="btn-secondary flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
              <button className="btn-primary flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>
        
        {/* Team Statistics Bar */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-white/50">
          <div className="grid grid-cols-4 gap-8">
            <StatCard
              icon={<Users className="w-6 h-6 text-white" />}
              label="Direct Team"
              value={stats.directTeam}
              subtext="Personally sponsored"
              variant="teal"
              change={{
                value: 12,
                isPositive: true
              }}
            />
            
            <StatCard
              icon={<GitBranch className="w-6 h-6 text-white" />}
              label="Total Team"
              value={stats.totalTeam}
              subtext="Entire organization"
              variant="green"
              change={{
                value: stats.teamGrowthRate,
                isPositive: stats.teamGrowthRate > 0
              }}
            />
            
            <StatCard
              icon={<Zap className="w-6 h-6 text-white" />}
              label="Active This Month"
              value={stats.activeThisMonth}
              subtext={`${stats.totalTeam > 0 ? Math.round((stats.activeThisMonth / stats.totalTeam) * 100) : 0}% activity rate`}
              variant="golden"
              change={{
                value: 8,
                isPositive: true
              }}
            />
            
            <StatCard
              icon={<UserPlus className="w-6 h-6 text-white" />}
              label="New This Week"
              value={stats.newThisWeek}
              subtext="Recent additions"
              variant="purple"
              change={{
                value: 15,
                isPositive: true
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}; 