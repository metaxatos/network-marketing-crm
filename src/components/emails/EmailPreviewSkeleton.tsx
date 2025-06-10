import { Skeleton } from '../ui/skeletons'

export const EmailPreviewSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton height={24} width={200} />
          <div className="flex gap-2">
            <Skeleton width={32} height={32} rounded="lg" />
            <Skeleton width={32} height={32} rounded="lg" />
            <Skeleton width={32} height={32} rounded="lg" />
          </div>
        </div>
        
        {/* Email Meta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton height={14} width={40} />
            <Skeleton height={14} width={220} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton height={14} width={50} />
            <Skeleton height={14} width={180} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton height={14} width={45} />
            <Skeleton height={14} width={140} />
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="p-6">
        {/* Subject */}
        <div className="mb-6">
          <Skeleton height={28} width="70%" />
        </div>

        {/* Body Content */}
        <div className="space-y-4">
          <Skeleton height={16} width="95%" />
          <Skeleton height={16} width="88%" />
          <Skeleton height={16} width="92%" />
          
          <div className="my-6">
            <Skeleton height={120} width="100%" />
          </div>
          
          <Skeleton height={16} width="90%" />
          <Skeleton height={16} width="85%" />
          <Skeleton height={16} width="78%" />
          
          {/* CTA Button Area */}
          <div className="my-8 text-center">
            <Skeleton height={48} width={180} rounded="lg" className="mx-auto" />
          </div>
          
          <Skeleton height={16} width="82%" />
          <Skeleton height={16} width="70%" />
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="space-y-2">
            <Skeleton height={14} width="60%" />
            <Skeleton height={14} width="45%" />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Skeleton width={100} height={36} rounded="lg" />
            <Skeleton width={80} height={36} rounded="lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton height={14} width={80} />
            <Skeleton width={60} height={20} rounded="full" />
          </div>
        </div>
      </div>
    </div>
  )
} 