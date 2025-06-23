'use client'

import { useTranslation } from '@/hooks/useTranslation'

interface LanguageToggleProps {
  className?: string
  compact?: boolean
  showLabel?: boolean
}

export function LanguageToggle({ 
  className = '', 
  compact = false,
  showLabel = true
}: LanguageToggleProps) {
  const { language, setLanguage } = useTranslation()

  const handleToggle = (newLanguage: 'en' | 'gr') => {
    if (newLanguage !== language) {
      setLanguage(newLanguage)
    }
  }

  if (compact) {
    return (
      <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
        <button
          onClick={() => handleToggle('en')}
          className={`
            flex items-center justify-center w-10 h-8 rounded-md transition-all duration-200
            ${language === 'en' 
              ? 'bg-white shadow-sm' 
              : 'hover:bg-gray-200/50'
            }
          `}
          aria-label="English"
        >
          <span className="text-base">🇬🇧</span>
        </button>
        
        <button
          onClick={() => handleToggle('gr')}
          className={`
            flex items-center justify-center w-10 h-8 rounded-md transition-all duration-200
            ${language === 'gr' 
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

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-600">Language:</span>
      )}
      
      <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
        {/* English Button */}
        <button
          onClick={() => handleToggle('en')}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200 min-w-[60px] justify-center
            ${language === 'en' 
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
            ${language === 'gr' 
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