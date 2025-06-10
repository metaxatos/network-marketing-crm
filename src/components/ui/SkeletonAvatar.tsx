import React from 'react'
import Skeleton from './Skeleton'

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  animated?: boolean
}

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  className = '',
  animated = true
}) => {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 64, height: 64 },
    xl: { width: 80, height: 80 }
  }

  const dimensions = sizeMap[size]

  return (
    <Skeleton
      width={dimensions.width}
      height={dimensions.height}
      rounded="full"
      className={className}
      animated={animated}
      aria-label="Loading avatar"
    />
  )
}

export default SkeletonAvatar 