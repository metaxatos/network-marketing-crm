'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/stores/userStore'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  
  const { login, isAuthenticated } = useUserStore()

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        // Success! Redirect to the intended page
        router.push(redirectTo)
        router.refresh()
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-celebration-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-3xl font-bold text-warm-800 mb-2">
            Welcome Back to OurTeam!
          </h1>
          <p className="text-warm-600">
            Ready to grow your business today?
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-warm-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 bg-white/30 rounded-sm mr-2 animate-shimmer"></div>
                  Signing In...
                </div>
              ) : (
                '🚀 Let\'s Go!'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot your password?
              </Link>
            </div>
            
            <div className="text-center border-t border-warm-200 pt-4">
              <p className="text-warm-600 mb-2">
                New to our community?
              </p>
              <Link
                href="/auth/signup"
                className="btn-secondary w-full text-center"
              >
                ✨ Start Your Journey
              </Link>
            </div>
          </div>
        </div>

        {/* Trust indicators - Updated */}
        <div className="text-center mt-8 text-sm text-warm-500">
          <p>🔒 Your data is secure and private</p>
          <p>🚀 Join thousands of successful marketers</p>
          <p className="mt-2 text-xs text-warm-400">Version 2.0 - Now with enhanced features!</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-celebration-50 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto animate-shimmer"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto animate-shimmer"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-shimmer"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
} 