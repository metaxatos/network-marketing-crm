import { Skeleton, SkeletonText } from '../ui/skeletons'

export const ContactFormSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Form Header */}
      <div className="space-y-2">
        <Skeleton height={24} width="40%" />
        <Skeleton height={16} width="60%" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Skeleton height={14} width={80} />
          <Skeleton height={40} width="100%" />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Skeleton height={14} width={60} />
          <Skeleton height={40} width="100%" />
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Skeleton height={14} width={70} />
          <Skeleton height={40} width="100%" />
        </div>

        {/* Company Field */}
        <div className="space-y-2">
          <Skeleton height={14} width={90} />
          <Skeleton height={40} width="100%" />
        </div>

        {/* Notes Field */}
        <div className="space-y-2">
          <Skeleton height={14} width={50} />
          <Skeleton height={80} width="100%" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Skeleton height={40} width={100} rounded="lg" />
        <Skeleton height={40} width={80} rounded="lg" />
      </div>
    </div>
  )
} 