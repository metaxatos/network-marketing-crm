'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/userStore'

export default function TestAuthStatusPage() {
  const { user, member, isLoading, isAuthenticated, initialize } = useUserStore()
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isTestingApi, setIsTestingApi] = useState(false)

  useEffect(() => {
    // Initialize auth on mount
    initialize()
  }, [initialize])

  const testSimpleEndpoint = async () => {
    setIsTestingApi(true)
    setApiError(null)
    setApiResponse(null)

    try {
      const response = await fetch('/api/auth/user-simple')
      const data = await response.json()
      
      if (!response.ok) {
        setApiError(`API Error: ${response.status} ${response.statusText}`)
      } else {
        setApiResponse(data)
      }
    } catch (error: any) {
      setApiError(error.message)
    } finally {
      setIsTestingApi(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Authentication Status Test</h1>

        {/* Auth Store State */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth Store State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>User Email:</strong> {user?.email || 'None'}</p>
            <p><strong>Member ID:</strong> {member?.id || 'None'}</p>
            <p><strong>Company ID:</strong> {member?.company_id || 'None'}</p>
          </div>
        </div>

        {/* API Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Simple API Endpoint</h2>
          <button
            onClick={testSimpleEndpoint}
            disabled={isTestingApi}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isTestingApi ? 'Testing...' : 'Test /api/auth/user-simple'}
          </button>

          {apiError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              <strong>Error:</strong> {apiError}
            </div>
          )}

          {apiResponse && (
            <div className="mt-4 p-4 bg-green-100 rounded">
              <strong>API Response:</strong>
              <pre className="mt-2 text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => initialize()}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Re-initialize Auth
            </button>
            <a
              href="/dashboard"
              className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
