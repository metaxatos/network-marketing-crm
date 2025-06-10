'use client';

import { Users, UserPlus, BookOpen, Lightbulb, Globe, GraduationCap } from 'lucide-react';

export const EmptyTeamState = () => {
  const handleInviteClick = () => {
    // TODO: Open invite modal or navigate to invite page
    console.log('Open invite modal');
  };

  const handleLearnClick = () => {
    // TODO: Navigate to training page
    console.log('Navigate to training');
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center p-6">
      <div className="text-center max-w-lg mx-auto">
        {/* Icon illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-action-purple to-action-coral rounded-full flex items-center justify-center mb-6 shadow-lg relative">
            <Users className="w-16 h-16 text-white" />
            {/* Decorative circles */}
            <div className="absolute inset-0 rounded-full border-2 border-white border-opacity-30 animate-pulse"></div>
            <div className="absolute -inset-2 rounded-full border-2 border-action-purple border-opacity-20"></div>
            <div className="absolute -inset-4 rounded-full border-2 border-action-coral border-opacity-10"></div>
          </div>
        </div>
        
        <h3 className="text-2xl font-display font-bold text-text-primary mb-4">
          Start Building Your Dream Team
        </h3>
        
        <p className="text-text-secondary mb-8 leading-relaxed text-base">
          Your network marketing journey begins here! Invite your first team member 
          and watch your organization grow into something amazing. 🌟
        </p>
        
        {/* Action buttons */}
        <div className="space-y-4 mb-8">
          <button 
            onClick={handleInviteClick}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-base font-semibold shadow-purple hover:shadow-lg transition-all duration-300"
          >
            <UserPlus className="w-5 h-5" />
            Invite Your First Team Member
          </button>
          
          <button 
            onClick={handleLearnClick}
            className="w-full btn-secondary flex items-center justify-center gap-3 py-4 text-base font-semibold hover:shadow-md transition-all duration-300"
          >
            <GraduationCap className="w-5 h-5" />
            Learn Team Building Strategies
          </button>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 bg-action-teal bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-action-teal" />
            </div>
            <h4 className="font-semibold text-text-primary text-sm mb-2">Share Your Page</h4>
            <p className="text-xs text-text-light">Use your landing page to attract prospects</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 bg-action-coral bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-action-coral" />
            </div>
            <h4 className="font-semibold text-text-primary text-sm mb-2">Follow Up</h4>
            <p className="text-xs text-text-light">Use email templates to stay connected</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 bg-action-golden bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6 text-action-golden" />
            </div>
            <h4 className="font-semibold text-text-primary text-sm mb-2">Keep Learning</h4>
            <p className="text-xs text-text-light">Complete training to improve skills</p>
          </div>
        </div>
        
        {/* Encouragement card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-action-purple border-opacity-20">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-action-golden" />
            <h4 className="font-display font-semibold text-text-primary">
              Success Starts With One
            </h4>
          </div>
          <p className="text-sm text-text-secondary">
            Every successful network marketer started exactly where you are now. 
            Your first team member is just one invitation away! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}; 