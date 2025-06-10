import React from 'react'
import Skeleton from '../ui/Skeleton'
import SkeletonText from '../ui/SkeletonText'
import SkeletonAvatar from '../ui/SkeletonAvatar'

interface ContactCardSkeletonProps {
  className?: string
  animated?: boolean
}

const ContactCardSkeleton: React.FC<ContactCardSkeletonProps> = ({
  className = '',
  animated = true
}) => {
  return (
    <div className={`bg-glass backdrop-blur-md rounded-xl border border-white/20 p-6 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Avatar with status indicator */}
        <div className="flex-shrink-0 relative">
          <SkeletonAvatar size="lg" animated={animated} />
          <Skeleton 
            width={20} 
            height={20} 
            rounded="full" 
            className="absolute -bottom-1 -right-1" 
            animated={animated}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Name */}
              <SkeletonText className="w-3/4" animated={animated} />
              {/* Status badge */}
              <Skeleton height={24} width={80} rounded="full" animated={animated} />
            </div>
            
            {/* Quick Actions (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} width={36} height={36} rounded="full" animated={animated} />
              ))}
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              <Skeleton width={16} height={16} className="mr-3" animated={animated} />
              <SkeletonText className="flex-1" animated={animated} />
            </div>
            <div className="flex items-center">
              <Skeleton width={16} height={16} className="mr-3" animated={animated} />
              <SkeletonText className="w-2/3" animated={animated} />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton 
                key={i} 
                height={24} 
                width={60 + Math.random() * 40} 
                rounded="full" 
                animated={animated} 
              />
            ))}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton width={12} height={12} animated={animated} />
                <SkeletonText className="w-20" animated={animated} />
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <Skeleton width={12} height={12} animated={animated} />
                <SkeletonText className="w-24" animated={animated} />
              </div>
            </div>
            
            {/* Expand Arrow */}
            <Skeleton width={20} height={20} animated={animated} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactCardSkeleton 