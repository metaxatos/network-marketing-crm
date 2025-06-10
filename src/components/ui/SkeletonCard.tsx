import React from 'react'
import Skeleton from './Skeleton'
import SkeletonText from './SkeletonText'
import SkeletonAvatar from './SkeletonAvatar'

interface SkeletonCardProps {
  variant?: 'default' | 'contact' | 'metric' | 'activity'
  className?: string
  animated?: boolean
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'default',
  className = '',
  animated = true
}) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 p-6'

  switch (variant) {
    case 'contact':
      return (
        <div className={`${baseClasses} ${className}`}>
          <div className="flex items-center gap-4">
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
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 space-y-2">
                  <SkeletonText className="w-3/4" animated={animated} />
                  <Skeleton height={20} width={80} rounded="full" animated={animated} />
                </div>
                <div className="hidden md:flex items-center gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} width={36} height={36} rounded="full" animated={animated} />
                  ))}
                </div>
              </div>
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
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} height={24} width={60} rounded="full" animated={animated} />
                  ))}
                </div>
                <Skeleton width={20} height={20} animated={animated} />
              </div>
            </div>
          </div>
        </div>
      )

    case 'metric':
      return (
        <div className={`${baseClasses} ${className}`}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonText className="w-20" animated={animated} />
              <Skeleton height={24} width={40} animated={animated} />
            </div>
            <Skeleton width={40} height={40} rounded="lg" animated={animated} />
          </div>
          <div className="mt-4">
            <SkeletonText className="w-2/3" animated={animated} />
          </div>
        </div>
      )

    case 'activity':
      return (
        <div className={`${baseClasses} ${className}`}>
          <div className="flex items-start gap-3">
            <SkeletonAvatar size="sm" animated={animated} />
            <div className="flex-1 space-y-2">
              <SkeletonText lines={2} animated={animated} />
              <div className="flex items-center gap-4">
                <Skeleton height={12} width={60} animated={animated} />
                <Skeleton height={12} width={40} animated={animated} />
              </div>
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className={`${baseClasses} ${className}`}>
          <div className="space-y-4">
            <SkeletonText lines={3} animated={animated} />
            <div className="flex justify-between items-center">
              <Skeleton height={32} width={80} rounded="md" animated={animated} />
              <Skeleton height={16} width={60} animated={animated} />
            </div>
          </div>
        </div>
      )
  }
}

export default SkeletonCard 