import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

export const useAppAuth = () => {
  const {
    user,
    member,
    profile,
    isAuthenticated,
    isLoading,
    loadUser,
    setLoading
  } = useUserStore()

  useEffect(() => {
    // Load user data on mount
    const initializeAuth = async () => {
      setLoading(true)
      await loadUser()
      setLoading(false)
    }

    initializeAuth()
  }, [loadUser, setLoading])

  // Note: Data loading for contacts, emails, courses, and landing pages
  // is now handled by React Query hooks in individual components
  // This provides better performance and caching

  return {
    user,
    member,
    profile,
    isAuthenticated,
    isLoading,
    loading: isLoading
  }
}

// Legacy export for backward compatibility
export const useAuth = useAppAuth 