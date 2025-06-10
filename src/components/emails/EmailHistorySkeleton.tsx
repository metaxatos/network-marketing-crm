import { Skeleton } from '../ui/skeletons'

export const EmailHistorySkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton height={24} width={140} />
        <Skeleton height={32} width={80} rounded="lg" />
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3">
        <Skeleton height={40} width={200} />
        <Skeleton height={40} width={120} />
        <Skeleton height={40} width={100} />
      </div>

      {/* Email Items */}
      <div className="space-y-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton width={32} height={32} rounded="full" />
                  <div className="space-y-1">
                    <Skeleton height={16} width={180} />
                    <Skeleton height={14} width={120} />
                  </div>
                </div>
                <Skeleton height={14} width="90%" />
                <Skeleton height={14} width="75%" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton height={14} width={80} />
                <Skeleton height={20} width={60} rounded="full" />
              </div>
            </div>
            
            {/* Email Stats */}
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton width={16} height={16} />
                <Skeleton height={14} width={20} />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton width={16} height={16} />
                <Skeleton height={14} width={20} />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton width={16} height={16} />
                <Skeleton height={14} width={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <Skeleton width={80} height={32} rounded="lg" />
        <Skeleton width={32} height={32} rounded="lg" />
        <Skeleton width={32} height={32} rounded="lg" />
        <Skeleton width={32} height={32} rounded="lg" />
        <Skeleton width={80} height={32} rounded="lg" />
      </div>
    </div>
  )
} 