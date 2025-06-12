'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function TestSimpleAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [member, setMember] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Check if user is already authenticated
  useEffect(() => {
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔔 Auth state changed:', event, !!session?.user)
        if (session?.user) {
          setUser(session.user)
          await loadMemberData(session.user)
        } else {
          setUser(null)
          setMember(null)
        }
        setAuthChecked(true)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('📋 Initial session check:', !!session?.user)
      
      if (session?.user) {
        setUser(session.user)
        await loadMemberData(session.user)
      }
    } catch (error) {
      console.error('❌ Auth check error:', error)
    } finally {
      setAuthChecked(true)
    }
  }

  const loadMemberData = async (user: User) => {
    try {
      console.log('👤 Loading member data for:', user.id)
      
      // Get member data with simple query first
      const { data: member, error } = await supabase
        .from('members')
        .select('id, email, company_id, username, name, avatar_url, phone, status, level, sponsor_id, created_at')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('❌ Member query error:', error)
        setMember(null)
        return
      }

      if (!member) {
        console.log('⚠️ No member found for user')
        setMember(null)
        return
      }

      // Get company data separately if member has a company
      let memberWithCompany = { ...member, companies: null }
      if (member.company_id) {
        try {
          const { data: companyData } = await supabase
            .from('companies')
            .select('id, name, slug, plan_type')
            .eq('id', member.company_id)
            .single()
          
          if (companyData) {
            memberWithCompany.companies = companyData
          }
        } catch (companyError) {
          console.warn('⚠️ Company fetch failed:', companyError)
        }
      }

      console.log('✅ Member loaded:', memberWithCompany.email)
      setMember(memberWithCompany)
    } catch (error) {
      console.error('❌ Member loading exception:', error)
      setMember(null)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('🚀 Attempting login...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Login error:', error)
        setError(error.message)
        return
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email)
        // Auth state change will handle the rest
        // Small delay to let auth state propagate
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      console.error('❌ Login exception:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Logout error:', error)
      } else {
        console.log('✅ Logout successful')
      }
    } catch (error) {
      console.error('❌ Logout exception:', error)
    }
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧪 Simple Auth Test
          </h1>
          <p className="text-gray-600">
            Direct Supabase - No Zustand
          </p>
        </div>

        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Status:</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>User:</span>
              <span className={user ? 'text-green-600' : 'text-red-600'}>
                {user ? `✅ ${user.email}` : '❌ Not authenticated'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Member:</span>
              <span className={member ? 'text-green-600' : 'text-orange-600'}>
                {member ? `✅ ${member.name || member.email}` : '⚠️ No member data'}
              </span>
            </div>
            {member?.companies && (
              <div className="flex justify-between">
                <span>Company:</span>
                <span className="text-green-600">
                  ✅ {member.companies.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {user ? (
          /* Authenticated State */
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-green-600">
              🎉 Authentication Successful!
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={goToDashboard}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!member}
              >
                {member ? '🚀 Go to Dashboard' : '⏳ Loading member data...'}
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🚪 Logout
              </button>
            </div>

            {!member && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ User authenticated but no member record found. This might indicate a database setup issue.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Login Form */
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  '🚀 Sign In (No Zustand)'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔍 This test bypasses Zustand completely</p>
          <p>✅ If this works, Zustand is the problem</p>
          <p>❌ If this fails, it's a deeper issue</p>
        </div>
      </div>
    </div>
  )
} 