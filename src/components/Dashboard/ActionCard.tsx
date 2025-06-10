'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

export type ActionCardVariant = 'teal' | 'coral' | 'purple' | 'golden' | 'green' | 'blue'

interface ActionCardProps {
  title: string
  subtitle: string
  href: string
  icon: ReactNode
  variant: ActionCardVariant
  isPrimary?: boolean
}

const variantStyles = {
  teal: {
    shadow: 'shadow-teal',
    iconBg: 'bg-action-teal',
    hoverShadow: 'hover:shadow-teal-lg',
  },
  coral: {
    shadow: 'shadow-coral',
    iconBg: 'bg-action-coral',
    hoverShadow: 'hover:shadow-coral-lg',
  },
  purple: {
    shadow: 'shadow-purple',
    iconBg: 'bg-action-purple',
    hoverShadow: 'hover:shadow-purple-lg',
  },
  golden: {
    shadow: 'shadow-golden',
    iconBg: 'bg-action-golden',
    hoverShadow: 'hover:shadow-golden-lg',
  },
  green: {
    shadow: 'shadow-green',
    iconBg: 'bg-action-green',
    hoverShadow: 'hover:shadow-green-lg',
  },
  blue: {
    shadow: 'shadow-blue',
    iconBg: 'bg-action-blue',
    hoverShadow: 'hover:shadow-blue-lg',
  },
}

export function ActionCard({ 
  title, 
  subtitle, 
  href, 
  icon, 
  variant,
  isPrimary = false
}: ActionCardProps) {
  const styles = variantStyles[variant]

  if (isPrimary) {
    return (
      <Link
        href={href}
        className={`
          bg-glass-white rounded-lg p-6 transition-all duration-300 
          hover:-translate-y-1 cursor-pointer group
          ${styles.shadow} ${styles.hoverShadow}
          h-[120px] flex items-center
        `}
      >
        <div className="flex items-center gap-4 w-full">
          {/* Circular Icon Background */}
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${styles.iconBg} transition-transform duration-300 group-hover:scale-105
          `}>
            <div className="w-10 h-10 text-white">
              {icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-text-primary mb-1">
              {title}
            </h3>
            <p className="text-sm text-text-light">
              {subtitle}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  // Legacy styling for non-primary cards (Quick Wins)
  return (
    <Link
      href={href}
      className="
        bg-glass border border-white border-opacity-40 rounded-xl p-4 transition-all duration-300 
        hover:bg-glass-white hover:shadow-sm cursor-pointer group
        h-[80px] flex items-center
      "
    >
      <div className="flex items-center gap-3 w-full">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${styles.iconBg} bg-opacity-10 transition-transform duration-300 group-hover:scale-105
        `}>
          <div className={`w-5 h-5 ${styles.iconBg.replace('bg-', 'text-')}`}>
            {icon}
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-text-primary text-sm mb-0.5">
            {title}
          </h4>
          <p className="text-xs text-text-secondary">
            {subtitle}
          </p>
        </div>
      </div>
    </Link>
  )
} 