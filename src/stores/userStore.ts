import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Member, MemberProfile } from '@/types'

interface Company {
  id: string
  name: string
  slug?: string
  plan_type?: string
}



interface UserState {
  user: User | null
  member: Member | null
  profile: MemberProfile | null
  company: Company | null
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
        isLoading: false,
        metrics: null,
        activities: []
      })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  },

  refreshUser: async () => {
    return get().initialize()
  },

  login: async (email: string, password: string) => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[UserStore] Login error:', error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Initialize user data after successful login
        await get().initialize()
        return { success: true }
      }

      return { success: false, error: 'Login failed' }
    } catch (error) {
      console.error('[UserStore] Login exception:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

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

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      const supabase = createClient()
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
      isLoading: false,
      metrics: null,
      activities: [],
    })
  },

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

  updateMember: async (data: Partial<Member>) => {
    try {
      console.log('[UserStore] Updating member with data:', data)
      
      const response = await fetch('/api/auth/member', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('[UserStore] Member update failed:', result.error)
        return { success: false, error: result.error || 'Update failed' }
      }

      console.log('[UserStore] Member update successful:', result.member)
      
      // Update the member in state
      set({ member: result.member })
      
      // Re-initialize to ensure all data is fresh
      setTimeout(() => {
        get().initialize()
      }, 100)
      
      return { success: true }
    } catch (error) {
      console.error('[UserStore] Member update error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

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
          // Get member data directly from client (simple query first)
          const { data: member, error: memberError } = await supabase
            .from('members')
            .select('id, email, company_id, username, name, avatar_url, phone, status, level, sponsor_id, created_at')
            .eq('id', session.user.id)
            .single()

          if (member && !memberError) {
            // Get company data separately if member has a company
            let company = null
            if (member.company_id) {
              try {
                const { data: companyData } = await supabase
                  .from('companies')
                  .select('id, name, slug, plan_type')
                  .eq('id', member.company_id)
                  .single()
                
                if (companyData) {
                  company = companyData
                }
              } catch (companyError) {
                console.warn('[UserStore] Company fetch failed:', companyError)
              }
            }

            console.log('[UserStore] Client-side fallback success')
            clearTimeout(timeoutId)
            set({
              user: session.user,
              member,
              profile: null, // We can add profile fetching later if needed
              company,
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
})) 
