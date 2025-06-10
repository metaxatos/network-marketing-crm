import { Skeleton } from '../ui/skeletons'

export const TeamSkeleton = () => {
  return (
    <div className="min-h-screen gradient-main">
      {/* Header Skeleton */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-6">
        <div className="space-y-4">
          {/* Title */}
          <Skeleton height={32} width={200} />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <Skeleton height={16} width={100} className="mb-2" />
                <Skeleton height={28} width={60} className="mb-1" />
                <Skeleton height={14} width={80} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls Skeleton */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <Skeleton height={40} width={300} />
          
          {/* View Toggle */}
          <div className="flex gap-2">
            <Skeleton height={40} width={80} />
            <Skeleton height={40} width={80} />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <Skeleton height={40} width={120} />
            <Skeleton height={40} width={100} />
          </div>
        </div>

        {/* Team Tree Skeleton */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <div className="space-y-4">
            {/* Root Level */}
            <div className="flex items-center gap-3">
              <Skeleton width={40} height={40} rounded="full" />
              <div className="space-y-1">
                <Skeleton height={16} width={150} />
                <Skeleton height={14} width={100} />
              </div>
              <div className="ml-auto flex gap-2">
                <Skeleton width={60} height={20} rounded="full" />
                <Skeleton width={32} height={32} rounded="lg" />
              </div>
            </div>

            {/* Level 1 Members */}
            <div className="ml-8 space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Skeleton width={36} height={36} rounded="full" />
                  <div className="space-y-1">
                    <Skeleton height={16} width={120} />
                    <Skeleton height={14} width={80} />
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Skeleton width={50} height={18} rounded="full" />
                    <Skeleton width={28} height={28} rounded="lg" />
                  </div>
                </div>
              ))}
            </div>

            {/* Level 2 Members */}
            <div className="ml-16 space-y-3">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Skeleton width={32} height={32} rounded="full" />
                  <div className="space-y-1">
                    <Skeleton height={14} width={100} />
                    <Skeleton height={12} width={70} />
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Skeleton width={45} height={16} rounded="full" />
                    <Skeleton width={24} height={24} rounded="lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 