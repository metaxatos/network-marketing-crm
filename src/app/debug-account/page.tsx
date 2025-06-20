'use client'

import { useState } from 'react'

export default function DebugAccountPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkAccountStatus = async () => {
    if (!email) {
      setError('Please enter an email address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/debug/user-status?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (response.ok) {
        setResult(data.data)
      } else {
        setError(data.message || 'Failed to check account status')
      }
    } catch (err) {
      setError('Network error - please try again')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-celebration-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-warm-800 mb-4">🔍 Account Debug Tool</h1>
          <p className="text-warm-600">
            Check your account status and troubleshoot login issues
          </p>
        </div>

        {/* Email Input */}
        <div className="card mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                onKeyPress={(e) => e.key === 'Enter' && checkAccountStatus()}
              />
            </div>
            
            <button
              onClick={checkAccountStatus}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? '🔍 Checking...' : '🚀 Check Account Status'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card mb-8 bg-red-50 border-red-200">
            <div className="text-red-700">
              <h3 className="font-semibold mb-2">❌ Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="card">
              <h3 className="text-xl font-semibold text-warm-800 mb-4">📊 Account Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className={`font-medium ${getStatusColor(result.status.userExists)}`}>
                    {getStatusIcon(result.status.userExists)} Auth User Exists
                  </div>
                  <div className={`font-medium ${getStatusColor(result.status.memberExists)}`}>
                    {getStatusIcon(result.status.memberExists)} Member Profile Exists
                  </div>
                  <div className={`font-medium ${getStatusColor(result.status.canLogin)}`}>
                    {getStatusIcon(result.status.canLogin)} Can Log In
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={`font-medium ${getStatusColor(!result.status.isOrphaned)}`}>
                    {getStatusIcon(!result.status.isOrphaned)} Account Complete
                  </div>
                  <div className={`font-medium ${getStatusColor(!result.status.needsCompletion)}`}>
                    {getStatusIcon(!result.status.needsCompletion)} Setup Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Auth User Details */}
            {result.authUser && (
              <div className="card">
                <h3 className="text-xl font-semibold text-warm-800 mb-4">🔐 Auth User Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {result.authUser.id}</div>
                  <div><strong>Email:</strong> {result.authUser.email}</div>
                  <div><strong>Email Confirmed:</strong> {result.authUser.emailConfirmed ? 'Yes' : 'No'}</div>
                  <div><strong>Created:</strong> {new Date(result.authUser.createdAt).toLocaleString()}</div>
                  {result.authUser.metadata && Object.keys(result.authUser.metadata).length > 0 && (
                    <div><strong>Metadata:</strong> {JSON.stringify(result.authUser.metadata, null, 2)}</div>
                  )}
                </div>
              </div>
            )}

            {/* Member Details */}
            {result.member && (
              <div className="card">
                <h3 className="text-xl font-semibold text-warm-800 mb-4">👤 Member Profile Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {result.member.id}</div>
                  <div><strong>Email:</strong> {result.member.email}</div>
                  <div><strong>Username:</strong> {result.member.username || 'Not set'}</div>
                  <div><strong>Name:</strong> {result.member.name || 'Not set'}</div>
                  <div><strong>First Name:</strong> {result.member.firstName || 'Not set'}</div>
                  <div><strong>Last Name:</strong> {result.member.lastName || 'Not set'}</div>
                  <div><strong>Status:</strong> {result.member.status}</div>
                  <div><strong>Company ID:</strong> {result.member.companyId}</div>
                  <div><strong>Created:</strong> {new Date(result.member.createdAt).toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold text-warm-800 mb-4">💡 Recommendations</h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Troubleshooting Steps */}
            <div className="card">
              <h3 className="text-xl font-semibold text-warm-800 mb-4">🛠️ Troubleshooting Steps</h3>
              
              {result.status.isOrphaned && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">🔧 Orphaned Account Detected</h4>
                  <p className="text-yellow-700 mb-2">
                    Your account exists in the authentication system but is missing profile information.
                  </p>
                  <p className="text-yellow-700">
                    <strong>Next Steps:</strong> Please contact support to complete your account setup, or try signing up again.
                  </p>
                </div>
              )}

              {!result.status.userExists && (
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Ready for Signup</h4>
                  <p className="text-green-700">
                    No existing account found. You can proceed with normal signup.
                  </p>
                </div>
              )}

              {result.status.canLogin && (
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Account Ready</h4>
                  <p className="text-green-700">
                    Your account is properly set up and you should be able to log in normally.
                  </p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <p><strong>Still having issues?</strong></p>
                <ul className="list-disc list-inside space-y-1 text-warm-600">
                  <li>Try logging out completely and logging back in</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Check if you're using the correct email address</li>
                  <li>Try resetting your password</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center mt-8 space-x-4">
          <a href="/auth/login" className="btn-secondary">
            🔐 Back to Login
          </a>
          <a href="/auth/signup" className="btn-secondary">
            📝 Try Signup
          </a>
        </div>
      </div>
    </div>
  )
} 