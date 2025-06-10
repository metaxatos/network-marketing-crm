'use client'

import { Grid, List } from 'lucide-react'

export type ViewType = 'grid' | 'table'

interface ViewToggleProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="hidden md:flex bg-glass backdrop-blur-md border border-white/20 rounded-xl p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
          ${view === 'grid' 
            ? 'bg-white text-action-purple shadow-sm' 
            : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
          }
        `}
      >
        <Grid className="w-4 h-4" />
        Grid
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
          ${view === 'table' 
            ? 'bg-white text-action-purple shadow-sm' 
            : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
          }
        `}
      >
        <List className="w-4 h-4" />
        Table
      </button>
    </div>
  )
} 