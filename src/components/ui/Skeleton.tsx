import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  animated?: boolean
  'aria-label'?: string
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = 'md',
  animated = true,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label={ariaLabel || "Loading content"}
      aria-live="polite"
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        animated && 'animate-shimmer',
        rounded === 'none' && 'rounded-none',
        rounded === 'sm' && 'rounded-sm',
        rounded === 'md' && 'rounded-md',
        rounded === 'lg' && 'rounded-lg',
        rounded === 'xl' && 'rounded-xl',
        rounded === 'full' && 'rounded-full',
        className
      )}
      style={{ width, height }}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Skeleton 