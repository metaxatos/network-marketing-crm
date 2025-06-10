import React from 'react'
import Skeleton from '../ui/Skeleton'
import SkeletonText from '../ui/SkeletonText'
import SkeletonCard from '../ui/SkeletonCard'

interface DashboardSkeletonProps {
  className?: string
  animated?: boolean
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  className = '',
  animated = true
}) => {
  return (
    <div className={`min-h-screen gradient-main pb-20 md:pb-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Card Skeleton */}
        <div className="mx-4 mb-6">
          <div className="bg-glass-white rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonText className="w-48" animated={animated} />
                <SkeletonText className="w-32" animated={animated} />
              </div>
              <Skeleton width={64} height={64} rounded="xl" animated={animated} />
            </div>
          </div>
        </div>

        {/* Quick Stats Row - Mobile */}
        <div className="block md:hidden mx-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-glass-white rounded-xl p-4 text-center border border-white/20">
                <Skeleton height={24} width={32} className="mx-auto mb-2" animated={animated} />
                <SkeletonText className="w-16 mx-auto" animated={animated} />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-4">
          
          {/* Left Column - Mobile: Full width, Desktop: 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Metrics Row - Desktop */}
            <div className="hidden md:grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} variant="metric" animated={animated} />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-glass-white rounded-2xl p-6 border border-white/20">
              <SkeletonText className="w-32 mb-4" animated={animated} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center space-y-3">
                    <Skeleton width={64} height={64} rounded="xl" className="mx-auto" animated={animated} />
                    <SkeletonText className="w-20 mx-auto" animated={animated} />
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-glass-white rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <SkeletonText className="w-32" animated={animated} />
                <Skeleton height={32} width={80} rounded="md" animated={animated} />
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <SkeletonCard key={i} variant="activity" className="p-0 border-0 bg-transparent" animated={animated} />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Progress Section */}
            <div className="bg-glass-white rounded-2xl p-6 border border-white/20">
              <SkeletonText className="w-24 mb-6" animated={animated} />
              <div className="grid grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="text-center space-y-3">
                    <Skeleton width={80} height={80} rounded="full" className="mx-auto" animated={animated} />
                    <SkeletonText className="w-16 mx-auto" animated={animated} />
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-action-purple">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton width={16} height={16} animated={animated} />
                  <SkeletonText className="w-24" animated={animated} />
                </div>
                <SkeletonText lines={2} animated={animated} />
              </div>
            </div>

            {/* Email Analytics Widget */}
            <div className="bg-glass-white rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <SkeletonText className="w-28" animated={animated} />
                <Skeleton width={20} height={20} animated={animated} />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <SkeletonText className="w-24" animated={animated} />
                    <Skeleton height={16} width={32} animated={animated} />
                  </div>
                ))}
              </div>
            </div>

            {/* Team Activity Feed - Desktop Only */}
            <div className="hidden lg:block bg-glass-white rounded-2xl p-6 border border-white/20">
              <SkeletonText className="w-32 mb-4" animated={animated} />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <SkeletonCard key={i} variant="activity" className="p-0 border-0 bg-transparent" animated={animated} />
                ))}
              </div>
            </div>

            {/* Encouragement Card */}
            <div className="bg-gradient-to-br from-action-purple/10 to-action-coral/10 rounded-2xl p-6 border border-white/20">
              <div className="text-center space-y-4">
                <Skeleton width={48} height={48} rounded="full" className="mx-auto" animated={animated} />
                <SkeletonText lines={3} animated={animated} />
                <Skeleton height={36} width={120} rounded="md" className="mx-auto" animated={animated} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton 