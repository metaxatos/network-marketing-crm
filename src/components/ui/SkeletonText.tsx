import React from 'react'
import Skeleton from './Skeleton'

interface SkeletonTextProps {
  lines?: number
  className?: string
  animated?: boolean
}

const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  className = '',
  animated = true
}) => {
  if (lines === 1) {
    return (
      <Skeleton
        height={16}
        width="100%"
        className={className}
        animated={animated}
        aria-label="Loading text"
      />
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? '75%' : '100%'}
          animated={animated}
          aria-label={`Loading text line ${index + 1}`}
        />
      ))}
    </div>
  )
}

export default SkeletonText 