'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getURL } from '@/utils/getURL'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage(
          `Password reset instructions have been sent to ${email}. Please check your email and follow the link to reset your password.`
        )
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
          <div className="text-6xl mb-4">🔑</div>
          <h1 className="text-3xl font-bold text-warm-800 mb-2">
            Reset Password
          </h1>
          <p className="text-warm-600">
            No worries! We'll help you get back in.
          </p>
        </div>

        {/* Reset Form */}
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
                Back to Login
              </Link>
            </div>
          ) : (
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
                <p className="text-xs text-warm-500 mt-1">
                  Enter the email address associated with your account
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 bg-white/30 rounded-sm mr-2 animate-shimmer"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  '🚀 Send Reset Link'
                )}
              </button>
            </form>
          )}

          {!message && (
            <div className="mt-6 text-center border-t border-warm-200 pt-4">
              <p className="text-warm-600 mb-2">
                Remember your password?
              </p>
              <Link
                href="/auth/login"
                className="btn-secondary w-full text-center"
              >
                🔐 Back to Login
              </Link>
            </div>
          )}
        </div>

        {/* Trust indicators */}
        <div className="text-center mt-8 text-sm text-warm-500">
          <p>🔒 Your data is secure and private</p>
          <p>💝 We're here to help you succeed</p>
        </div>
      </div>
    </div>
  )
}
