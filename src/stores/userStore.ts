import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Member, MemberProfile, DashboardMetrics, Activity } from '@/types'
import { subscribeWithSelector } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

interface Company {
  id: string
  name: string
  domain?: string
}

interface AuthState {
  user: User | null
  member: Member | null
  profile: MemberProfile | null
  company: Company | null
  isLoading: boolean
  isAuthenticated: boolean
  metrics: any | null
  activities: any[]
}

interface AuthActions {
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, memberData: {
    first_name: string
    last_name: string
    username?: string
    phone?: string
    companyId?: string | null
    sponsorId?: string | null
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<MemberProfile>) => Promise<{ success: boolean; error?: string }>
  updateMember: (data: Partial<Member>) => Promise<{ success: boolean; error?: string }>
  checkUsernameAvailability: (username: string) => Promise<boolean>
}

type UserStore = AuthState & AuthActions

interface UserState {
  user: any | null
  member: any | null
  profile: any | null
  company: any | null
  isAuthenticated: boolean
  isLoading: boolean
  metrics: any | null
  activities: any[]
}

interface UserActions {
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (userData: Partial<UserState>) => void
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  user: null,
  member: null,
  profile: null,
  company: null,
  isAuthenticated: false,
  isLoading: true,
  metrics: null,
  activities: [],

  setUser: (userData) => {
    set(userData)
  },

  signOut: async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      set({ 
        user: null, 
        member: null, 
        profile: null, 
        company: null,
        isAuthenticated: false, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  },

  refreshUser: async () => {
    // Same as initialize but can be called manually
    return get().initialize()
  },

  // Initialize authentication state
  initialize: async () => {
    const currentState = get()
    
    // Prevent re-initialization if user already loaded and authenticated
    if (currentState.user && currentState.isAuthenticated && !currentState.isLoading) {
      console.log('[UserStore] User already loaded, skipping initialization')
      return
    }
    
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('[UserStore] Auth loading timeout after 10 seconds, proceeding without auth')
      set({ 
        user: null, 
        member: null, 
        profile: null, 
        company: null,
        isAuthenticated: false, 
        isLoading: false 
      })
    }, 10000) // 10 seconds timeout

    try {
      set({ isLoading: true })
      
      // Get current session
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('[UserStore] Session found for user:', session?.user?.id || 'none')
      
      if (session?.user) {
        try {
          // Create AbortController for fetch timeout
          const controller = new AbortController()
          const fetchTimeout = setTimeout(() => {
            console.warn('[UserStore] Fetch timeout - API call took too long')
            controller.abort()
          }, 8000) // 8 seconds for fetch

          // Try server-side API first
          const response = await fetch('/api/auth/user-simple', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            signal: controller.signal
          })

          clearTimeout(fetchTimeout)

          if (response.ok) {
            const userData = await response.json()
            console.log('[UserStore] Server API success:', !!userData.user)
            
            clearTimeout(timeoutId)
            set({
              user: userData.user,
              member: userData.member,
              profile: userData.profile,
              company: userData.company,
              isAuthenticated: true,
              isLoading: false
            })
            return
          } else {
            console.warn('[UserStore] Server API failed:', response.status, await response.text())
          }
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            console.warn('[UserStore] Fetch aborted due to timeout')
          } else {
            console.error('[UserStore] Fetch error:', fetchError)
          }
        }

        // Fallback: Try client-side data fetching when server fails
        console.log('[UserStore] Falling back to client-side data fetching')
        try {
          // Get member data directly from client
          const { data: member, error: memberError } = await supabase
            .from('members')
            .select(`
              id,
              name,
              email,
              avatar_url,
              company_id,
              companies (
                id,
                name,
                slug,
                plan_type
              )
            `)
            .eq('id', session.user.id)
            .single()

          if (member && !memberError) {
            console.log('[UserStore] Client-side fallback success')
            clearTimeout(timeoutId)
            set({
              user: session.user,
              member,
              profile: null, // We can add profile fetching later if needed
              company: member.companies,
              isAuthenticated: true,
              isLoading: false
            })
            return
          } else {
            console.error('[UserStore] Client-side member fetch failed:', memberError)
          }
        } catch (clientError) {
          console.error('[UserStore] Client-side fallback failed:', clientError)
        }
      }

      // If we get here, authentication failed
      clearTimeout(timeoutId)
      set({ 
        user: null, 
        member: null, 
        profile: null, 
        company: null,
        isAuthenticated: false, 
        isLoading: false 
      })

    } catch (error) {
      console.error('[UserStore] Initialize error:', error)
      clearTimeout(timeoutId)
      set({ 
        user: null, 
        member: null, 
        profile: null, 
        company: null,
        isAuthenticated: false, 
        isLoading: false 
      })
    }
  },

  // Login action
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        set({ isLoading: false })
        return { success: false, error: result.error || 'Login failed' }
      }

      set({ 
        user: result.user, 
        member: result.member,
        profile: result.profile,
        company: result.company,
        isAuthenticated: true,
        isLoading: false 
      })
      
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Signup action
  signup: async (email: string, password: string, memberData: {
    first_name: string
    last_name: string
    username?: string
    phone?: string
    companyId?: string | null
    sponsorId?: string | null
  }) => {
    try {
      set({ isLoading: true })
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          firstName: memberData.first_name,
          lastName: memberData.last_name,
          username: memberData.username,
          phone: memberData.phone,
          companyId: memberData.companyId,
          sponsorId: memberData.sponsorId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        set({ isLoading: false })
        return { success: false, error: result.error || 'Signup failed' }
      }

      set({ 
        user: result.user, 
        member: result.member,
        profile: result.profile,
        company: result.company,
        isAuthenticated: true,
        isLoading: false 
      })
      
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Logout action
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    set({
      user: null,
      member: null,
      profile: null,
      company: null,
      isAuthenticated: false,
      metrics: null,
      activities: [],
    })
  },

  // Update profile
  updateProfile: async (data: Partial<MemberProfile>) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Update failed' }
      }

      set({ profile: result.profile })
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Update member
  updateMember: async (data: Partial<Member>) => {
    try {
      const response = await fetch('/api/auth/member', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Update failed' }
      }

      set({ member: result.member })
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Check username availability
  checkUsernameAvailability: async (username: string) => {
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
      const result = await response.json()
      return result.available
    } catch (error) {
      console.error('Username check error:', error)
      return false
    }
  },
})) 
