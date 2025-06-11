import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Member, MemberProfile, DashboardMetrics, Activity } from '@/types'
import { subscribeWithSelector } from 'zustand/middleware'

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

export const useUserStore = create<UserStore>()(
  persist(
    subscribeWithSelector(
      (set, get) => ({
        // Initial state
        user: null,
        member: null,
        profile: null,
        company: null,
        isLoading: true,
        isAuthenticated: false,
        metrics: null,
        activities: [],

        // Initialize authentication state
        initialize: async () => {
          try {
            set({ isLoading: true })
            
            // Get current session
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.user) {
              // Fetch full user data
              const response = await fetch('/api/auth/user')
              const result = await response.json()
              
              if (response.ok) {
                set({
                  user: session.user,
                  member: result.member,
                  profile: result.profile,
                  company: result.company,
                  isAuthenticated: true,
                  isLoading: false
                })
              } else {
                set({ 
                  user: null, 
                  member: null, 
                  profile: null, 
                  company: null,
                  isAuthenticated: false, 
                  isLoading: false 
                })
              }
            } else {
              set({ 
                user: null, 
                member: null, 
                profile: null, 
                company: null,
                isAuthenticated: false, 
                isLoading: false 
              })
            }
          } catch (error) {
            console.error('Initialize error:', error)
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
      })
    ),
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