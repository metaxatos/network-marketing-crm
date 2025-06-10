'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export type TrendDirection = 'up' | 'down' | 'neutral'

interface StatsBubbleProps {
  number: string | number
  label: string
  trend?: TrendDirection
  trendValue?: string
  color?: 'teal' | 'coral' | 'purple' | 'golden' | 'green' | 'blue'
}

const colorStyles = {
  teal: 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100',
  coral: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100',
  purple: 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100',
  golden: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100',
  green: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100',
  blue: 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100',
}

const trendStyles = {
  up: {
    icon: TrendingUp,
    color: 'text-action-green',
    bg: 'bg-green-100',
  },
  down: {
    icon: TrendingDown,
    color: 'text-action-coral',
    bg: 'bg-red-100',
  },
  neutral: {
    icon: Minus,
    color: 'text-text-light',
    bg: 'bg-gray-100',
  },
}

export function StatsBubble({ 
  number, 
  label, 
  trend = 'neutral', 
  trendValue,
  color = 'purple' 
}: StatsBubbleProps) {
  const TrendIcon = trendStyles[trend].icon
  const colorClass = colorStyles[color]

  return (
    <div className={`
      p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-md
      ${colorClass}
    `}>
      <div className="text-center">
        {/* Main Number */}
        <div className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
          {number}
        </div>
        
        {/* Label */}
        <div className="text-xs md:text-sm text-text-secondary font-medium mb-2">
          {label}
        </div>

        {/* Trend Indicator */}
        {(trend !== 'neutral' || trendValue) && (
          <div className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            ${trendStyles[trend].bg} ${trendStyles[trend].color}
          `}>
            <TrendIcon className="w-3 h-3" />
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
    </div>
  )
} 