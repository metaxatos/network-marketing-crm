'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push('/dashboard')
      } else {
        // User is not authenticated, redirect to login
        router.push('/auth/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
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
              <div className="h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback UI (should rarely be seen due to redirects)
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🌟</div>
        <h1 className="text-3xl font-bold text-warm-800 mb-4">
          Welcome to Network Marketing CRM
        </h1>
        <p className="text-warm-600 mb-8">
          Your Success Companion
        </p>
        <div className="space-y-4">
          <Link href="/auth/login" className="btn-primary w-full text-center">
            🔐 Login
          </Link>
          <Link href="/auth/signup" className="btn-secondary w-full text-center">
            ✨ Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
