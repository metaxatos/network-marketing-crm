import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Member, MemberProfile, DashboardMetrics, Activity } from '@/types'

interface UserStore {
  // Auth state
  user: User | null
  member: Member | null
  profile: MemberProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Dashboard data
  metrics: DashboardMetrics | null
  activities: Activity[]
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, profile: Partial<MemberProfile>) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  loadDashboard: () => Promise<void>
  updateProfile: (updates: Partial<MemberProfile>) => Promise<void>
  updateMember: (updates: Partial<Member>) => Promise<void>
  checkUsernameAvailability: (username: string) => Promise<boolean>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      member: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      metrics: null,
      activities: [],

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
            isAuthenticated: true,
            isLoading: false 
          })
          
          // Load dashboard data after successful login
          await get().loadDashboard()
          
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      // Signup action
      signup: async (email: string, password: string, profileData: Partial<MemberProfile>) => {
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
              profile: profileData 
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
          isAuthenticated: false,
          metrics: null,
          activities: [],
        })
      },

      // Load user data
      loadUser: async () => {
        try {
          const response = await fetch('/api/auth/user')
          
          if (!response.ok) {
            // User not authenticated
            set({
              user: null,
              member: null,
              profile: null,
              isAuthenticated: false,
            })
            return
          }

          const result = await response.json()
          set({ 
            user: result.user,
            member: result.member,
            profile: result.profile,
            isAuthenticated: true 
          })
        } catch (error) {
          console.error('Load user error:', error)
          set({
            user: null,
            member: null,
            profile: null,
            isAuthenticated: false,
          })
        }
      },

      // Load dashboard data
      loadDashboard: async () => {
        try {
          // Load metrics
          const metricsResponse = await fetch('/api/dashboard/metrics')
          if (metricsResponse.ok) {
            const metricsData = await metricsResponse.json()
            set({ metrics: metricsData.metrics })
          }

          // Load activities
          const activitiesResponse = await fetch('/api/dashboard/activities')
          if (activitiesResponse.ok) {
            const activitiesData = await activitiesResponse.json()
            set({ activities: activitiesData.activities || [] })
          }
        } catch (error) {
          console.error('Dashboard load error:', error)
        }
      },

      // Update profile (using direct Supabase for now - could be moved to API later)
      updateProfile: async (updates: Partial<MemberProfile>) => {
        const { user, profile } = get()
        if (!user || !profile) return

        try {
          const { error } = await supabase
            .from('member_profiles')
            .update(updates)
            .eq('member_id', user.id)

          if (!error) {
            set({ profile: { ...profile, ...updates } })
          }
        } catch (error) {
          console.error('Profile update error:', error)
        }
      },

      // Update member data (using direct Supabase for now - could be moved to API later)
      updateMember: async (updates: Partial<Member>) => {
        const { user, member } = get()
        if (!user || !member) return

        try {
          const { error } = await supabase
            .from('members')
            .update(updates)
            .eq('id', user.id)

          if (!error) {
            set({ member: { ...member, ...updates } })
          }
        } catch (error) {
          console.error('Member update error:', error)
        }
      },

      // Check username availability (using direct Supabase for now)
      checkUsernameAvailability: async (username: string) => {
        try {
          const { data, error } = await supabase
            .from('members')
            .select('username')
            .eq('username', username)
            .single()

          if (error && error.code === 'PGRST116') {
            // No rows found, username is available
            return true
          }

          // If we found a row, username is taken
          return false
        } catch (error) {
          console.error('Username check error:', error)
          return false
        }
      },

      // Set user (for auth state changes)
      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        })
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        user: state.user,
        member: state.member,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
) 