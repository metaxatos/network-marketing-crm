import React from 'react'
import Skeleton from '../ui/Skeleton'
import SkeletonText from '../ui/SkeletonText'

interface MetricCardSkeletonProps {
  className?: string
  animated?: boolean
}

const MetricCardSkeleton: React.FC<MetricCardSkeletonProps> = ({
  className = '',
  animated = true
}) => {
  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonText className="w-20" animated={animated} />
          <Skeleton height={28} width={48} animated={animated} />
        </div>
        <Skeleton width={48} height={48} rounded="xl" animated={animated} />
      </div>
      <div className="mt-4">
        <SkeletonText className="w-2/3" animated={animated} />
      </div>
    </div>
  )
}

export default MetricCardSkeleton 