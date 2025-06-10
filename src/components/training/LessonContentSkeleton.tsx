import { Skeleton } from '../ui/skeletons'

export const LessonContentSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <Skeleton height={28} width="60%" />
            <Skeleton height={16} width="40%" />
          </div>
          <div className="flex gap-2">
            <Skeleton width={32} height={32} rounded="full" />
            <Skeleton width={32} height={32} rounded="full" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton height={14} width={80} />
            <Skeleton height={14} width={40} />
          </div>
          <Skeleton height={8} width="100%" rounded="full" />
        </div>
      </div>

      {/* Video Player Area */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Skeleton height={400} width="100%" />
        
        {/* Video Controls */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton width={40} height={40} rounded="full" />
              <Skeleton width={40} height={40} rounded="full" />
              <Skeleton width={40} height={40} rounded="full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton height={14} width={60} />
              <Skeleton width={24} height={24} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <Skeleton height={6} width="100%" rounded="full" />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton height={20} width={140} className="mb-4" />
            <div className="space-y-3">
              <Skeleton height={16} width="95%" />
              <Skeleton height={16} width="88%" />
              <Skeleton height={16} width="92%" />
              <Skeleton height={16} width="85%" />
            </div>
          </div>

          {/* Key Points */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton height={20} width={100} className="mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton width={20} height={20} rounded="full" />
                  <Skeleton height={16} width="80%" />
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton height={20} width={120} className="mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <Skeleton width={32} height={32} />
                  <div className="flex-1 space-y-1">
                    <Skeleton height={16} width="70%" />
                    <Skeleton height={14} width="50%" />
                  </div>
                  <Skeleton width={80} height={32} rounded="lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton height={20} width={120} className="mb-4" />
            <div className="space-y-2">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg">
                  <Skeleton width={20} height={20} rounded="full" />
                  <div className="flex-1">
                    <Skeleton height={14} width="80%" />
                  </div>
                  <Skeleton height={12} width={30} />
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton height={20} width={80} />
              <Skeleton width={60} height={32} rounded="lg" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <Skeleton height={14} width="90%" />
                  <Skeleton height={12} width="60%" className="mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 