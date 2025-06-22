'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Languages, Globe } from 'lucide-react'
import { useState } from 'react'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('language')
  const [isOpen, setIsOpen] = useState(false)

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return

    // Remove current locale from pathname if it exists
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    
    // Build new path with new locale
    const newPath = newLocale === 'el' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`
    
    setIsOpen(false)
    router.push(newPath)
    router.refresh()
  }

  return (
    <div className="relative">
      {/* Mobile/Desktop Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 hover:bg-white border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
        aria-label={t('switch')}
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {locale === 'el' ? 'ΕΛ' : 'EN'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="p-2">
              <button
                onClick={() => switchLanguage('el')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  locale === 'el'
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">🇬🇷</span>
                <div>
                  <div className="font-medium">{t('greek')}</div>
                  <div className="text-xs text-gray-500">Ελληνικά</div>
                </div>
                {locale === 'el' && (
                  <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </button>
              
              <button
                onClick={() => switchLanguage('en')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  locale === 'en'
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">🇺🇸</span>
                <div>
                  <div className="font-medium">{t('english')}</div>
                  <div className="text-xs text-gray-500">English</div>
                </div>
                {locale === 'en' && (
                  <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Compact version for mobile bottom nav
export function CompactLanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const switchLanguage = () => {
    const newLocale = locale === 'el' ? 'en' : 'el'
    
    // Remove current locale from pathname if it exists
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    
    // Build new path with new locale
    const newPath = newLocale === 'el' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`
    
    router.push(newPath)
    router.refresh()
  }

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
      aria-label="Switch Language"
    >
      <span className="text-xs font-medium text-gray-700">
        {locale === 'el' ? 'EN' : 'ΕΛ'}
      </span>
    </button>
  )
}