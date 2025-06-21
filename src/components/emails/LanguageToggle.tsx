'use client'

import { useState, useEffect } from 'react'

interface LanguageToggleProps {
  selectedLanguage: 'en' | 'gr'
  onLanguageChange: (language: 'en' | 'gr') => void
  className?: string
}

export function LanguageToggle({ 
  selectedLanguage, 
  onLanguageChange,
  className = ''
}: LanguageToggleProps) {
  const handleToggle = (language: 'en' | 'gr') => {
    if (language !== selectedLanguage) {
      onLanguageChange(language)
      // Store preference
      localStorage.setItem('preferredLanguage', language)
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-600">Language:</span>
      
      <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
        {/* English Button */}
        <button
          onClick={() => handleToggle('en')}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200 min-w-[60px] justify-center
            ${selectedLanguage === 'en' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
            }
          `}
        >
          <span className="text-base">🇬🇧</span>
          <span>EN</span>
        </button>
        
        {/* Greek Button */}
        <button
          onClick={() => handleToggle('gr')}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200 min-w-[60px] justify-center
            ${selectedLanguage === 'gr' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
            }
          `}
        >
          <span className="text-base">🇬🇷</span>
          <span>GR</span>
        </button>
      </div>
    </div>
  )
}

// Compact version for mobile
export function LanguageToggleCompact({ 
  selectedLanguage, 
  onLanguageChange 
}: LanguageToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onLanguageChange('en')}
        className={`
          flex items-center justify-center w-10 h-8 rounded-md transition-all duration-200
          ${selectedLanguage === 'en' 
            ? 'bg-white shadow-sm' 
            : 'hover:bg-gray-200/50'
          }
        `}
        aria-label="English"
      >
        <span className="text-base">🇬🇧</span>
      </button>
      
      <button
        onClick={() => onLanguageChange('gr')}
        className={`
          flex items-center justify-center w-10 h-8 rounded-md transition-all duration-200
          ${selectedLanguage === 'gr' 
            ? 'bg-white shadow-sm' 
            : 'hover:bg-gray-200/50'
          }
        `}
        aria-label="Greek"
      >
        <span className="text-base">🇬🇷</span>
      </button>
    </div>
  )
} 