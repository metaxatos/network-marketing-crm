import { useEffect, useRef } from 'react'
import { useUserStore } from '@/stores/userStore'

// Global flag to ensure initialize is only called once
let isInitialized = false
let initializePromise: Promise<void> | null = null

export const useAppAuth = () => {
  const {
    user,
    member,
    company,
    isAuthenticated,
    isLoading,
    initialize
  } = useUserStore()

  useEffect(() => {
    // Only initialize once globally, not per component
    if (!isInitialized && !initializePromise) {
      isInitialized = true
      initializePromise = initialize().catch((error: any) => {
        console.warn('Auth initialization failed:', error)
        // Reset on error so it can retry
        isInitialized = false
        initializePromise = null
      })
    }
  }, []) // Empty dependency array

  // Note: Data loading for contacts, emails, courses, and landing pages
  // is now handled by React Query hooks in individual components
  // This provides better performance and caching

  return {
    user,
    member,
    company,
    isAuthenticated,
    isLoading,
    loading: isLoading
  }
}

// Legacy export for backward compatibility
export const useAuth = useAppAuth 