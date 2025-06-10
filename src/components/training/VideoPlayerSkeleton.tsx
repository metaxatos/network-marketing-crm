import React from 'react'
import Skeleton from '../ui/Skeleton'
import SkeletonText from '../ui/SkeletonText'

interface VideoPlayerSkeletonProps {
  className?: string
  animated?: boolean
}

const VideoPlayerSkeleton: React.FC<VideoPlayerSkeletonProps> = ({
  className = '',
  animated = true
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Video Player Area */}
      <div className="relative">
        <Skeleton height={300} width="100%" rounded="none" animated={animated} />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton width={64} height={64} rounded="full" animated={animated} />
        </div>
        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Skeleton height={4} width="100%" animated={animated} />
        </div>
      </div>
      
      {/* Video Info */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <SkeletonText className="w-3/4" animated={animated} />
          <SkeletonText lines={2} animated={animated} />
        </div>
        
        {/* Video metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton width={16} height={16} animated={animated} />
              <SkeletonText className="w-16" animated={animated} />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width={16} height={16} animated={animated} />
              <SkeletonText className="w-12" animated={animated} />
            </div>
          </div>
          <Skeleton height={32} width={100} rounded="md" animated={animated} />
        </div>
        
        {/* Lesson navigation */}
        <div className="border-t pt-4 space-y-3">
          <SkeletonText className="w-24" animated={animated} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Skeleton width={32} height={32} rounded="md" animated={animated} />
                <div className="flex-1 space-y-1">
                  <SkeletonText className="w-2/3" animated={animated} />
                  <SkeletonText className="w-1/3" animated={animated} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayerSkeleton 