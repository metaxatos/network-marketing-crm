import React from 'react'
import Skeleton from '../ui/Skeleton'
import SkeletonText from '../ui/SkeletonText'

interface CourseCardSkeletonProps {
  className?: string
  animated?: boolean
}

const CourseCardSkeleton: React.FC<CourseCardSkeletonProps> = ({
  className = '',
  animated = true
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Thumbnail */}
      <Skeleton height={160} width="100%" rounded="none" animated={animated} />
      
      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <SkeletonText className="w-3/4" animated={animated} />
          <SkeletonText lines={2} animated={animated} />
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <SkeletonText className="w-16" animated={animated} />
            <SkeletonText className="w-12" animated={animated} />
          </div>
          <Skeleton height={8} width="100%" rounded="full" animated={animated} />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton width={16} height={16} animated={animated} />
            <SkeletonText className="w-20" animated={animated} />
          </div>
          <Skeleton height={32} width={80} rounded="md" animated={animated} />
        </div>
      </div>
    </div>
  )
}

export default CourseCardSkeleton 