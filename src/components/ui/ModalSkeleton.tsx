import { Skeleton } from './skeletons'

interface ModalSkeletonProps {
  variant?: 'form' | 'content' | 'confirmation' | 'list'
}

export const ModalSkeleton = ({ variant = 'content' }: ModalSkeletonProps) => {
  if (variant === 'form') {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton height={24} width="60%" />
          <Skeleton height={16} width="80%" />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton height={14} width={100} />
              <Skeleton height={40} width="100%" />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Skeleton width={80} height={40} rounded="lg" />
          <Skeleton width={100} height={40} rounded="lg" />
        </div>
      </div>
    )
  }

  if (variant === 'confirmation') {
    return (
      <div className="p-6 text-center space-y-6">
        {/* Icon */}
        <Skeleton width={64} height={64} rounded="full" className="mx-auto" />
        
        {/* Text */}
        <div className="space-y-3">
          <Skeleton height={24} width="70%" className="mx-auto" />
          <Skeleton height={16} width="85%" className="mx-auto" />
          <Skeleton height={16} width="60%" className="mx-auto" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-4">
          <Skeleton width={80} height={40} rounded="lg" />
          <Skeleton width={100} height={40} rounded="lg" />
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Skeleton height={24} width={180} />
          <Skeleton width={32} height={32} rounded="lg" />
        </div>

        {/* Search/Filter */}
        <div className="px-6">
          <Skeleton height={40} width="100%" />
        </div>

        {/* List Items */}
        <div className="px-6 space-y-3 max-h-96 overflow-y-auto">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
              <Skeleton width={40} height={40} rounded="full" />
              <div className="flex-1 space-y-1">
                <Skeleton height={16} width="70%" />
                <Skeleton height={14} width="50%" />
              </div>
              <Skeleton width={60} height={32} rounded="lg" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Skeleton width={80} height={40} rounded="lg" />
          <Skeleton width={100} height={40} rounded="lg" />
        </div>
      </div>
    )
  }

  // Default content variant
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="space-y-2">
          <Skeleton height={24} width={200} />
          <Skeleton height={16} width={150} />
        </div>
        <Skeleton width={32} height={32} rounded="lg" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton height={16} width="95%" />
        <Skeleton height={16} width="88%" />
        <Skeleton height={16} width="92%" />
        
        <div className="my-6">
          <Skeleton height={120} width="100%" />
        </div>
        
        <Skeleton height={16} width="90%" />
        <Skeleton height={16} width="85%" />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Skeleton width={80} height={40} rounded="lg" />
        <Skeleton width={100} height={40} rounded="lg" />
      </div>
    </div>
  )
} 