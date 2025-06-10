'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import MemberSetup from '@/components/auth/MemberSetup'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, member, loadUser, setLoading } = useUserStore()
  const [showMemberSetup, setShowMemberSetup] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  // Initialize store in development
  useEffect(() => {
    if (!initialized) {
      setInitialized(true)
      // In development, immediately set loading to false
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 [DEV] Bypassing auth loading state')
        setLoading(false)
      }
    }
  }, [initialized, setLoading])

  useEffect(() => {
    // Temporarily disable auth redirect for development
    if (process.env.NODE_ENV === 'production' && !isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && !member) {
      loadUser().catch((error: any) => {
        console.warn('Member loading failed, continuing with minimal setup:', error)
      })
    }
  }, [isAuthenticated, member, loadUser])

  useEffect(() => {
    // Skip member setup if no member data loaded (development mode)
    if (member && (!member.email || !member.phone || !member.username)) {
      setShowMemberSetup(true)
    }
  }, [member])

  // In development, skip all loading and auth checks
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>
  }

  // Show loading while checking authentication (production only)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto animate-shimmer"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto animate-shimmer"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-shimmer"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded-lg animate-shimmer"></div>
              <div className="h-16 bg-gray-200 rounded-lg animate-shimmer"></div>
              <div className="h-16 bg-gray-200 rounded-lg animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated (production only)
  if (!isAuthenticated) {
    return null
  }

  // Show member setup if needed (production only)
  if (showMemberSetup) {
    return (
      <MemberSetup 
        onComplete={() => {
          setShowMemberSetup(false)
          loadUser() // Reload member data
        }} 
      />
    )
  }

  return <>{children}</>
} 