'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/stores/userStore'

function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  
  const { signup, isAuthenticated } = useUserStore()

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const result = await signup(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
      })

      if (result.success) {
        // User successfully created, redirect to dashboard
        router.push(redirectTo)
        router.refresh()
      } else {
        setError(result.error || 'Signup failed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 via-white to-celebration-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-warm-800 mb-2">
            Start Your Journey!
          </h1>
          <p className="text-warm-600">
            Join thousands of successful network marketers
          </p>
        </div>

        {/* Signup Form */}
        <div className="card">
          {message ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-warm-800 mb-4">
                Check Your Email!
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 mb-6">
                {message}
              </div>
              <Link
                href="/auth/login"
                className="btn-primary w-full text-center"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-warm-700 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="John"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-warm-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Doe"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-warm-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-warm-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                    Creating Account...
                  </div>
                ) : (
                  '🌟 Create My Account'
                )}
              </button>
            </form>
          )}

          {/* Links */}
          <div className="mt-6 space-y-4">
            <div className="text-center border-t border-warm-200 pt-4">
              <p className="text-warm-600 mb-2">
                Already have an account?
              </p>
              <Link
                href="/auth/login"
                className="btn-secondary w-full text-center"
              >
                🚀 Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center mt-8 text-sm text-warm-500">
          <p>🔒 Your data is secure and private</p>
          <p>💝 No spam, ever. We respect your inbox</p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-success-50 via-white to-celebration-50 flex items-center justify-center">
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
              <div className="h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
} 