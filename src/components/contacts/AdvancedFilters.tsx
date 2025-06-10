'use client'

import { useState } from 'react'
import { X, Filter, Calendar, Tag, Mail, Phone } from 'lucide-react'
import type { ContactStatus } from '@/types'

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterOptions) => void
  currentFilters: FilterOptions
}

export interface FilterOptions {
  dateRange?: {
    from?: Date
    to?: Date
  }
  tags?: string[]
  hasEmail?: boolean
  hasPhone?: boolean
  lastContactedRange?: {
    from?: Date
    to?: Date
  }
}

export function AdvancedFilters({ isOpen, onClose, onApplyFilters, currentFilters }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters)

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: FilterOptions = {}
    setFilters(resetFilters)
    onApplyFilters(resetFilters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-action-purple/10 flex items-center justify-center">
              <Filter className="w-5 h-5 text-action-purple" />
            </div>
            <h2 className="text-xl font-display font-semibold text-text-primary">
              Advanced Filters
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-text-secondary hover:text-text-primary transition-colors duration-200 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Contact Info Filters */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-action-teal" />
              Contact Information
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.hasEmail || false}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasEmail: e.target.checked || undefined }))}
                  className="w-5 h-5 text-action-purple rounded border-2 border-white/20 bg-white/10 focus:ring-2 focus:ring-action-purple/20"
                />
                <span className="text-text-primary">Has email address</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.hasPhone || false}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasPhone: e.target.checked || undefined }))}
                  className="w-5 h-5 text-action-purple rounded border-2 border-white/20 bg-white/10 focus:ring-2 focus:ring-action-purple/20"
                />
                <span className="text-text-primary">Has phone number</span>
              </label>
            </div>
          </div>

          {/* Date Added Filter */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-action-golden" />
              Date Added
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-2">From</label>
                <input
                  type="date"
                  value={filters.dateRange?.from?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      from: e.target.value ? new Date(e.target.value) : undefined
                    }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-text-primary placeholder-text-light focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm text-text-secondary mb-2">To</label>
                <input
                  type="date"
                  value={filters.dateRange?.to?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange,
                      to: e.target.value ? new Date(e.target.value) : undefined
                    }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-text-primary placeholder-text-light focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Last Contacted Filter */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-action-coral" />
              Last Contacted
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-2">From</label>
                <input
                  type="date"
                  value={filters.lastContactedRange?.from?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    lastContactedRange: {
                      ...prev.lastContactedRange,
                      from: e.target.value ? new Date(e.target.value) : undefined
                    }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-text-primary placeholder-text-light focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm text-text-secondary mb-2">To</label>
                <input
                  type="date"
                  value={filters.lastContactedRange?.to?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    lastContactedRange: {
                      ...prev.lastContactedRange,
                      to: e.target.value ? new Date(e.target.value) : undefined
                    }
                  }))}
                  className="w-full px-3 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-text-primary placeholder-text-light focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium"
          >
            Reset All
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-text-secondary hover:text-text-primary transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            
            <button
              onClick={handleApply}
              className="px-6 py-2.5 rounded-lg bg-action-purple text-white hover:bg-action-purple/90 shadow-purple hover:shadow-purple-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 