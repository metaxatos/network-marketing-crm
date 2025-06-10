import React from 'react'
import Skeleton from '../ui/Skeleton'
import SkeletonText from '../ui/SkeletonText'

interface EmailTemplateSkeletonProps {
  className?: string
  animated?: boolean
}

const EmailTemplateSkeleton: React.FC<EmailTemplateSkeletonProps> = ({
  className = '',
  animated = true
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton width={48} height={48} rounded="lg" animated={animated} />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SkeletonText className="w-3/4" animated={animated} />
              <SkeletonText className="w-1/2" animated={animated} />
            </div>
            <Skeleton height={20} width={60} rounded="full" animated={animated} />
          </div>
          <SkeletonText lines={2} animated={animated} />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <Skeleton height={12} width={80} animated={animated} />
              <Skeleton height={12} width={60} animated={animated} />
            </div>
            <div className="flex gap-2">
              <Skeleton height={32} width={60} rounded="md" animated={animated} />
              <Skeleton height={32} width={80} rounded="md" animated={animated} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailTemplateSkeleton 