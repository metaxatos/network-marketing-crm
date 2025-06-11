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
    username: '',
    phone: '',
    companyId: '',
    sponsorId: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const sponsorParam = searchParams.get('sponsor') // For affiliate links
  
  const { signup, isAuthenticated } = useUserStore()

  // Auto-fill sponsor ID from URL parameter
  useEffect(() => {
    if (sponsorParam) {
      setFormData(prev => ({ ...prev, sponsorId: sponsorParam }))
    }
  }, [sponsorParam])

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-z0-9_-]+$/
    return usernameRegex.test(username) && username.length >= 3 && username.length <= 30
  }

  const checkUsernameAvailability = async (username: string) => {
    if (!validateUsername(username)) {
      setUsernameAvailable(false)
      return
    }

    setUsernameChecking(true)
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
      const result = await response.json()
      setUsernameAvailable(result.available)
    } catch (error) {
      console.error('Username check failed:', error)
      setUsernameAvailable(false)
    } finally {
      setUsernameChecking(false)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setFormData(prev => ({ ...prev, username: cleaned }))
    
    if (cleaned.length >= 3) {
      checkUsernameAvailability(cleaned)
    } else {
      setUsernameAvailable(null)
    }
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

    if (!formData.username || !validateUsername(formData.username)) {
      setError('Username must be 3-30 characters, lowercase letters, numbers, hyphens, and underscores only')
      return
    }

    if (usernameAvailable === false) {
      setError('Username is already taken')
      return
    }

    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setIsLoading(true)

    try {
      const result = await signup(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        phone: formData.phone,
        companyId: formData.companyId || null,
        sponsorId: formData.sponsorId || null,
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
          {sponsorParam && (
            <p className="text-sm text-purple-600 mt-2">
              🎉 You've been invited to join this amazing team!
            </p>
          )}
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
                    First Name *
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
                    Last Name *
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
                  Email Address *
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
                <label htmlFor="username" className="block text-sm font-medium text-warm-700 mb-2">
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  required
                  className={`input ${
                    usernameAvailable === true ? 'border-green-500' : 
                    usernameAvailable === false ? 'border-red-500' : ''
                  }`}
                  placeholder="your-username"
                  disabled={isLoading}
                />
                {usernameChecking && (
                  <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
                )}
                {usernameAvailable === true && (
                  <p className="text-sm text-green-500 mt-1">✓ Username is available!</p>
                )}
                {usernameAvailable === false && formData.username.length >= 3 && (
                  <p className="text-sm text-red-500 mt-1">✗ Username is taken</p>
                )}
                <p className="text-xs text-warm-500 mt-1">
                  For your personal landing page: yoursite.com/{formData.username || 'username'}
                </p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-warm-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-2">
                    Password *
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
                    Confirm Password *
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
              </div>

              {/* Optional fields for advanced users */}
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg p-4 text-warm-700 bg-warm-50 hover:bg-warm-100 transition-colors">
                  <span className="text-sm font-medium">Advanced Options (Optional)</span>
                  <span className="ml-1.5 h-5 w-5 flex-shrink-0 rotate-0 transform transition-transform group-open:rotate-180">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="companyId" className="block text-sm font-medium text-warm-700 mb-2">
                      Company ID
                    </label>
                    <input
                      id="companyId"
                      name="companyId"
                      type="text"
                      value={formData.companyId}
                      onChange={handleChange}
                      className="input"
                      placeholder="Leave empty for default company"
                      disabled={isLoading}
                    />
                  </div>

                  {!sponsorParam && (
                    <div>
                      <label htmlFor="sponsorId" className="block text-sm font-medium text-warm-700 mb-2">
                        Sponsor ID
                      </label>
                      <input
                        id="sponsorId"
                        name="sponsorId"
                        type="text"
                        value={formData.sponsorId}
                        onChange={handleChange}
                        className="input"
                        placeholder="Who invited you? (Optional)"
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>
              </details>

              <button
                type="submit"
                disabled={isLoading || usernameAvailable === false}
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