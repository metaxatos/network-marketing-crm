import { Skeleton } from '../ui/skeletons'

export const CourseProgressSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton height={24} width={200} />
          <Skeleton height={16} width={150} />
        </div>
        <Skeleton width={80} height={20} rounded="full" />
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Skeleton height={14} width={120} />
          <Skeleton height={14} width={40} />
        </div>
        <Skeleton height={8} width="100%" rounded="full" />
        <div className="flex justify-between mt-2">
          <Skeleton height={12} width={80} />
          <Skeleton height={12} width={60} />
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <Skeleton height={18} width={100} />
        
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
            {/* Status Icon */}
            <Skeleton width={24} height={24} rounded="full" />
            
            {/* Lesson Info */}
            <div className="flex-1 space-y-1">
              <Skeleton height={16} width="70%" />
              <Skeleton height={14} width="50%" />
            </div>
            
            {/* Duration */}
            <Skeleton height={14} width={50} />
            
            {/* Progress */}
            <div className="w-20">
              <Skeleton height={6} width="100%" rounded="full" />
            </div>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="text-center space-y-2">
          <Skeleton height={32} width={40} className="mx-auto" />
          <Skeleton height={14} width={80} />
        </div>
        <div className="text-center space-y-2">
          <Skeleton height={32} width={40} className="mx-auto" />
          <Skeleton height={14} width={70} />
        </div>
        <div className="text-center space-y-2">
          <Skeleton height={32} width={40} className="mx-auto" />
          <Skeleton height={14} width={90} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
        <Skeleton width={120} height={40} rounded="lg" />
        <Skeleton width={100} height={40} rounded="lg" />
      </div>
    </div>
  )
} 