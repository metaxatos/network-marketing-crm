import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

export const useAppAuth = () => {
  const {
    user,
    member,
    profile,
    company,
    isAuthenticated,
    isLoading,
    initialize
  } = useUserStore()

  useEffect(() => {
    // Initialize authentication on mount
    initialize().catch((error: any) => {
      console.warn('Auth initialization failed:', error)
    })
  }, [initialize])

  // Note: Data loading for contacts, emails, courses, and landing pages
  // is now handled by React Query hooks in individual components
  // This provides better performance and caching

  return {
    user,
    member,
    profile,
    company,
    isAuthenticated,
    isLoading,
    loading: isLoading
  }
}

// Legacy export for backward compatibility
export const useAuth = useAppAuth 