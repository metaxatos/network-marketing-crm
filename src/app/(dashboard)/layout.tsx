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
  const { isAuthenticated, isLoading, member, initialize } = useUserStore()
  const [showMemberSetup, setShowMemberSetup] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  // Initialize auth store
  useEffect(() => {
    if (!initialized) {
      setInitialized(true)
      initialize().catch((error: any) => {
        console.warn('Auth initialization failed:', error)
      })
    }
  }, [initialized, initialize])

  useEffect(() => {
    // Redirect to login if not authenticated (production only)
    if (process.env.NODE_ENV === 'production' && !isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Check if member setup is needed - ALWAYS check this, even in development
    if (isAuthenticated && member && (!member.email || !member.phone || !member.username)) {
      console.log('[DashboardLayout] Member setup needed:', {
        hasEmail: !!member.email,
        hasPhone: !!member.phone,
        hasUsername: !!member.username
      })
      setShowMemberSetup(true)
    } else if (isAuthenticated && member) {
      console.log('[DashboardLayout] Member profile complete')
      setShowMemberSetup(false)
    }
  }, [isAuthenticated, member])

  // Show loading while checking authentication (production only)
  if (process.env.NODE_ENV === 'production' && isLoading) {
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
  if (process.env.NODE_ENV === 'production' && !isAuthenticated) {
    return null
  }

  // Show member setup if needed (BOTH production and development)
  if (showMemberSetup) {
    return (
      <MemberSetup 
        onComplete={() => {
          console.log('[DashboardLayout] Member setup completed, refreshing data...')
          setShowMemberSetup(false)
          // Reload member data after completion
          initialize().then(() => {
            console.log('[DashboardLayout] Member data reloaded after setup')
          })
        }} 
      />
    )
  }

  return <>{children}</>
} 