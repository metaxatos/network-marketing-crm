'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Auth session error:', error)
        }
        
        if (isMounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.warn('Auth session failed, continuing without auth:', error)
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Fallback: Ensure loading doesn't get stuck (increased timeout for slow connections)
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth loading timeout after 10 seconds, proceeding without auth')
        setLoading(false)
      }
    }, 10000) // Increased from 3 seconds to 10 seconds

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (isMounted) {
            setUser(session?.user ?? null)
            
            // Only set loading to false if we're not already finished loading
            if (loading) {
              setLoading(false)
            }
          }
        } catch (error) {
          console.warn('Auth state change failed:', error)
          if (isMounted) {
            setUser(null)
            if (loading) {
              setLoading(false)
            }
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
} 