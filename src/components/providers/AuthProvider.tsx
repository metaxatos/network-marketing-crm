'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/userStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, loadUser, loadDashboard } = useUserStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUser()
        loadDashboard()
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUser()
        await loadDashboard()
      }
      
      if (event === 'SIGNED_OUT') {
        // Clear all user data
        useUserStore.setState({
          user: null,
          profile: null,
          isAuthenticated: false,
          metrics: null,
          activities: [],
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, loadUser, loadDashboard])

  return <>{children}</>
} 