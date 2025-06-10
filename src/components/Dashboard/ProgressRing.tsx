'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface ProgressRingProps {
  percentage: number
  label: string
  size?: number
  strokeWidth?: number
  showCelebration?: boolean
}

export function ProgressRing({ 
  percentage, 
  label, 
  size = 80, 
  strokeWidth = 8,
  showCelebration = true 
}: ProgressRingProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const [showParticles, setShowParticles] = useState(false)

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference

  useEffect(() => {
    // Animate the progress ring on mount
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage)
    }, 100)

    // Show celebration particles if at 100%
    if (percentage >= 100 && showCelebration) {
      const celebrationTimer = setTimeout(() => {
        setShowParticles(true)
        // Hide particles after animation
        setTimeout(() => setShowParticles(false), 1000)
      }, 800)
      return () => {
        clearTimeout(timer)
        clearTimeout(celebrationTimer)
      }
    }

    return () => clearTimeout(timer)
  }, [percentage, showCelebration])

  const isComplete = percentage >= 100

  return (
    <div className="relative flex flex-col items-center">
      {/* SVG Progress Ring */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle with gradient */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="50%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#FFD93D" />
            </linearGradient>
          </defs>
        </svg>

        {/* Percentage text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold transition-all duration-300 ${
              isComplete ? 'text-action-green text-xl' : 'text-text-primary text-lg'
            }`}>
              {isComplete ? (
                <div className="flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-action-golden" />
                </div>
              ) : (
                `${Math.round(animatedPercentage)}%`
              )}
            </div>
          </div>
        </div>

        {/* Celebration Particles */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-action-golden rounded-full animate-ping`}
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
      </div>
    </div>
  )
} 