'use client'

import { useState, useEffect } from 'react'
import { useContactStore } from '@/stores/contactStore'
import { Search, X } from 'lucide-react'

export function SearchBar() {
  const { searchQuery, searchContacts } = useContactStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchContacts(localQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [localQuery, searchContacts])

  // Sync with store when external changes occur
  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  const handleClear = () => {
    setLocalQuery('')
    searchContacts('')
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-text-light" />
        </div>
        
        <input
          type="text"
          className="w-full min-h-[44px] px-4 py-3 pl-12 pr-12 rounded-full border-2 border-white/20 bg-glass backdrop-blur-md text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
          placeholder="Search your network..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
        />
        
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center touch-target group"
          >
            <div className="w-6 h-6 rounded-full bg-text-light/10 group-hover:bg-text-light/20 flex items-center justify-center transition-colors duration-200">
              <X className="h-4 w-4 text-text-light group-hover:text-text-secondary transition-colors duration-200" />
            </div>
          </button>
        )}
      </div>
      
      {localQuery && (
        <div className="mt-2 text-sm text-text-secondary">
          Searching for "<span className="font-medium text-action-purple">{localQuery}</span>"...
        </div>
      )}
    </div>
  )
} 