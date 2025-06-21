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
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = (language: 'en' | 'gr') => {
    if (language !== selectedLanguage) {
      setIsAnimating(true)
      onLanguageChange(language)
      
      // Store preference
      localStorage.setItem('preferredLanguage', language)
      
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-600">Language:</span>
      
      <div className="relative bg-gray-100 rounded-full p-1">
        {/* Sliding Background */}
        <div
          className={`
            absolute top-1 h-10 w-20 bg-gradient-to-r rounded-full
            transition-all duration-300 ease-out
            ${selectedLanguage === 'en' 
              ? 'left-1 from-blue-500 to-blue-600' 
              : 'left-[88px] from-blue-400 to-blue-500'
            }
            ${isAnimating ? 'scale-95' : 'scale-100'}
          `}
        />
        
        {/* English Button */}
        <button
          onClick={() => handleToggle('en')}
          className={`
            relative z-10 flex items-center gap-2 px-4 py-2 rounded-full
            transition-all duration-300
            ${selectedLanguage === 'en' 
              ? 'text-white' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          <span className="text-xl" role="img" aria-label="English">🇬🇧</span>
          <span className="font-medium">EN</span>
        </button>
        
        {/* Greek Button */}
        <button
          onClick={() => handleToggle('gr')}
          className={`
            relative z-10 flex items-center gap-2 px-4 py-2 rounded-full
            transition-all duration-300
            ${selectedLanguage === 'gr' 
              ? 'text-white' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          <span className="text-xl" role="img" aria-label="Greek">🇬🇷</span>
          <span className="font-medium">GR</span>
        </button>
      </div>
      
      {/* Active Language Label */}
      <div className={`
        ml-2 px-3 py-1 rounded-full text-xs font-medium
        transition-all duration-300
        ${selectedLanguage === 'en' 
          ? 'bg-blue-100 text-blue-700' 
          : 'bg-blue-100 text-blue-700'
        }
        ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
      `}>
        {selectedLanguage === 'en' ? 'English' : 'Ελληνικά'}
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
    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
      <button
        onClick={() => onLanguageChange('en')}
        className={`
          p-2 rounded-full transition-all duration-200
          ${selectedLanguage === 'en' 
            ? 'bg-white shadow-sm' 
            : 'hover:bg-gray-200'
          }
        `}
        aria-label="English"
      >
        <span className="text-lg">🇬🇧</span>
      </button>
      
      <button
        onClick={() => onLanguageChange('gr')}
        className={`
          p-2 rounded-full transition-all duration-200
          ${selectedLanguage === 'gr' 
            ? 'bg-white shadow-sm' 
            : 'hover:bg-gray-200'
          }
        `}
        aria-label="Greek"
      >
        <span className="text-lg">🇬🇷</span>
      </button>
    </div>
  )
} 