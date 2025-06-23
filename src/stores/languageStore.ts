import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LanguageStore {
  language: 'en' | 'gr'
  setLanguage: (language: 'en' | 'gr') => void
  isInitialized: boolean
  initializeLanguage: () => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'en',
      isInitialized: false,
      setLanguage: (language) => {
        set({ language })
        // Also store in localStorage for immediate access
        localStorage.setItem('preferredLanguage', language)
      },
      initializeLanguage: () => {
        if (get().isInitialized) return
        
        // Try to get language from localStorage first
        const stored = localStorage.getItem('preferredLanguage') as 'en' | 'gr' | null
        
        // If no stored preference, detect from browser
        let language: 'en' | 'gr' = 'en'
        if (stored && (stored === 'en' || stored === 'gr')) {
          language = stored
        } else if (typeof window !== 'undefined') {
          const browserLang = navigator.language.toLowerCase()
          if (browserLang.startsWith('el') || browserLang.startsWith('gr')) {
            language = 'gr'
          }
        }
        
        set({ language, isInitialized: true })
        localStorage.setItem('preferredLanguage', language)
      }
    }),
    {
      name: 'language-preference',
      partialize: (state) => ({ language: state.language })
    }
  )
)