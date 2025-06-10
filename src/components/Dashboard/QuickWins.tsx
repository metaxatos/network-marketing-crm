'use client'

import { ActionCard } from './ActionCard'
import { ReactNode } from 'react'
import { ActionCardVariant } from './ActionCard'

interface QuickWinAction {
  title: string
  subtitle: string
  href: string
  icon: ReactNode
  variant: ActionCardVariant
}

interface QuickWinsProps {
  actions: QuickWinAction[]
}

export function QuickWins({ actions }: QuickWinsProps) {
  // Limit to maximum 3 items as specified
  const limitedActions = actions.slice(0, 3)

  return (
    <section className="quick-wins">
      <h3 className="font-display text-base font-medium text-text-primary mb-4">
        More You Can Do
      </h3>
      
      {/* Desktop: Regular grid, Mobile: Horizontal scroll */}
      <div className="relative">
        <div className="
          flex gap-4 md:grid md:grid-cols-3 md:gap-4
          overflow-x-auto md:overflow-visible
          scrollbar-hide
          pb-2
        ">
          {limitedActions.map((action, index) => (
            <div key={index} className="flex-shrink-0 w-64 md:w-auto">
              <ActionCard
                title={action.title}
                subtitle={action.subtitle}
                href={action.href}
                icon={action.icon}
                variant={action.variant}
                isPrimary={false}
              />
            </div>
          ))}
        </div>
        
        {/* Add a subtle fade overlay on mobile to indicate scrollability */}
        <div className="
          md:hidden absolute right-0 top-0 bottom-0 w-8 
          bg-gradient-to-l from-white from-10% to-transparent 
          pointer-events-none
        " />
      </div>
    </section>
  )
} 