'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'next/navigation'

export default function DebugDashboardPage() {
  const router = useRouter()
  const { 
    user, 
    member, 
    isLoading, 
    isAuthenticated, 
    initialize 
  } = useUserStore()

  useEffect(() => {
    // Force a timeout after 5 seconds if still loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Dashboard: Forcing navigation to test page due to timeout')
        router.push('/test-auth-status')
      }
    }, 5000)

    // Initialize auth
    initialize().catch((error) => {
      console.error('Dashboard: Auth initialization failed:', error)
    })

    return () => clearTimeout(timeout)
  }, [isLoading, initialize, router])

  // Debug info in console
  useEffect(() => {
    console.log('Dashboard Debug State:', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      hasMember: !!member,
      userId: user?.id,
      memberCompanyId: member?.company_id
    })
  }, [isLoading, isAuthenticated, user, member])

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
          <h2 className="mt-6 text-xl font-semibold text-gray-700">Loading your success...</h2>
          <p className="mt-2 text-sm text-gray-500">
            This is taking longer than expected.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            You'll be redirected to a test page in 5 seconds...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-main flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Not Authenticated</h2>
          <a 
            href="/auth/login" 
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  // Simple dashboard content
  return (
    <div className="min-h-screen gradient-main p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Welcome back, {user?.email || 'User'}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Debug Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Member ID:</strong> {member?.id || 'None'}</p>
              <p><strong>Company ID:</strong> {member?.company_id || 'None'}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a 
                href="/contacts" 
                className="block w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
              >
                My Contacts
              </a>
              <a 
                href="/emails" 
                className="block w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
              >
                Send Email
              </a>
              <a 
                href="/training" 
                className="block w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-center"
              >
                Training
              </a>
            </div>
          </div>

          {/* Test Pages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Pages</h2>
            <div className="space-y-3">
              <a 
                href="/test-auth-status" 
                className="block w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-center"
              >
                Auth Status Test
              </a>
              <a 
                href="/test-auth" 
                className="block w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-center"
              >
                Auth Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
