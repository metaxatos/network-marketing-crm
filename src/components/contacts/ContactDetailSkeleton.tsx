import React from 'react'
import Skeleton from '../ui/Skeleton'
import SkeletonText from '../ui/SkeletonText'
import SkeletonAvatar from '../ui/SkeletonAvatar'

interface ContactDetailSkeletonProps {
  className?: string
  animated?: boolean
}

const ContactDetailSkeleton: React.FC<ContactDetailSkeletonProps> = ({
  className = '',
  animated = true
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <SkeletonAvatar size="xl" animated={animated} />
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <SkeletonText className="w-1/2" animated={animated} />
            <Skeleton height={24} width={100} rounded="full" animated={animated} />
          </div>
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} height={36} width={36} rounded="md" animated={animated} />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton height={36} width={80} rounded="md" animated={animated} />
          <Skeleton height={36} width={80} rounded="md" animated={animated} />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <SkeletonText className="w-1/3 mb-3" animated={animated} />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton width={20} height={20} animated={animated} />
                  <SkeletonText className="flex-1" animated={animated} />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <SkeletonText className="w-1/3 mb-3" animated={animated} />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <SkeletonText key={i} animated={animated} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-8">
        <SkeletonText className="w-1/4 mb-3" animated={animated} />
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton 
              key={i} 
              height={28} 
              width={80 + Math.random() * 60} 
              rounded="full" 
              animated={animated} 
            />
          ))}
        </div>
      </div>

      {/* Activity History */}
      <div>
        <SkeletonText className="w-1/3 mb-4" animated={animated} />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <SkeletonAvatar size="sm" animated={animated} />
              <div className="flex-1 space-y-2">
                <SkeletonText lines={2} animated={animated} />
                <div className="flex items-center gap-4">
                  <Skeleton height={12} width={60} animated={animated} />
                  <Skeleton height={12} width={40} animated={animated} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ContactDetailSkeleton 