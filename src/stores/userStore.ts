import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Member } from '@/types'

interface Company {
  id: string
  name: string
  slug?: string
  plan_type?: string
}

interface UserState {
  user: User | null
  member: Member | null
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
  updateProfile: (data: Partial<Member>) => Promise<{ success: boolean; error?: string }>
  updateMember: (data: Partial<Member>) => Promise<{ success: boolean; error?: string }>
  checkUsernameAvailability: (username: string) => Promise<boolean>
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  user: null,
  member: null,
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
      await supabase.auth.signOut()
      set({ 
        user: null, 
        member: null, 
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
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    set({
      user: null,
      member: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,
      metrics: null,
      activities: [],
    })
  },

  updateProfile: async (data: Partial<Member>) => {
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

      set({ member: result.member })
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  updateMember: async (data: Partial<Member>) => {
    // Since profile is merged into member, updateMember and updateProfile do the same thing
    return get().updateProfile(data)
  },

  checkUsernameAvailability: async (username: string) => {
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
      const result = await response.json()
      return result.available
    } catch (error) {
      console.error('Username check failed:', error)
      return false
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true })
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('[UserStore] Session error:', sessionError)
        set({ user: null, member: null, company: null, isAuthenticated: false, isLoading: false })
        return
      }

      if (!session?.user) {
        set({ user: null, member: null, company: null, isAuthenticated: false, isLoading: false })
        return
      }

      // Get member data (consolidated profile included)
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (memberError) {
        console.error('[UserStore] Member fetch error:', memberError)
        set({ user: session.user, member: null, company: null, isAuthenticated: true, isLoading: false })
        return
      }

      // Fetch company data separately if member has a company
      let company = null
      if (member?.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('id, name, slug, plan_type')
          .eq('id', member.company_id)
          .single()
        
        company = companyData
      }

      set({
        user: session.user,
        member: member,
        company: company,
        isAuthenticated: true,
        isLoading: false,
      })

    } catch (error) {
      console.error('[UserStore] Initialize error:', error)
      set({ user: null, member: null, company: null, isAuthenticated: false, isLoading: false })
    }
  },
})) 
