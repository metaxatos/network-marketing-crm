import { useEffect } from 'react'
import { useLanguageStore } from '@/stores/languageStore'
import { en } from '@/translations/en'
import { gr } from '@/translations/gr'

const translations = { en, gr }

export function useTranslation() {
  const { language, setLanguage, isInitialized, initializeLanguage } = useLanguageStore()
  
  // Initialize language on first use
  useEffect(() => {
    if (!isInitialized) {
      initializeLanguage()
    }
  }, [isInitialized, initializeLanguage])
  
  const t = (key: string, variables?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      // Fallback to English if key not found in current language
      let fallbackValue: any = translations.en
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k]
      }
      value = typeof fallbackValue === 'string' ? fallbackValue : key
    }
    
    // Handle variable interpolation
    if (variables && typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (match, variableName) => {
        return variables[variableName] !== undefined ? String(variables[variableName]) : match
      })
    }
    
    return value || key // Final fallback to key if translation missing
  }
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'gr' : 'en')
  }
  
  const isGreek = language === 'gr'
  const isEnglish = language === 'en'
  
  return { 
    t, 
    language, 
    setLanguage, 
    toggleLanguage,
    isGreek,
    isEnglish,
    isInitialized
  }
}