'use client'

import { useState } from 'react'

export default function EmailDebugPage() {
  const [testEmail, setTestEmail] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebugTest = async () => {
    if (!testEmail) {
      alert('Please enter your email address')
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/debug/email-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: 'Failed to run debug test', details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Email Debug Test
          </h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Email Address
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@domain.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={runDebugTest}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Run Debug Test'}
              </button>
            </div>
          </div>

          {results && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Debug Results</h2>
              
              {results.data && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-700 mb-2">Test Summary:</h3>
                  <p className="text-sm text-gray-600">{results.data.test_summary}</p>
                </div>
              )}

              {results.data?.environment_check && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-700 mb-2">Environment Check:</h3>
                  <div className="text-sm space-y-1">
                    <div>RESEND_API_KEY: {results.data.environment_check.resend_api_key ? '✅ Set' : '❌ Missing'}</div>
                    <div>SUPABASE_URL: {results.data.environment_check.supabase_url ? '✅ Set' : '❌ Missing'}</div>
                    <div>SUPABASE_KEY: {results.data.environment_check.supabase_key ? '✅ Set' : '❌ Missing'}</div>
                    <div>Environment: {results.data.environment_check.node_env}</div>
                  </div>
                </div>
              )}

              {results.data?.tests && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Email Method Tests:</h3>
                  {results.data.tests.map((test: any, index: number) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-md border ${test.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {test.success ? '✅' : '❌'} {test.method.replace(/_/g, ' ').toUpperCase()}
                        </h4>
                        {test.message_id && (
                          <span className="text-xs text-gray-500">ID: {test.message_id}</span>
                        )}
                      </div>
                      
                      {test.error && (
                        <div className="text-sm text-red-600 mb-2">
                          <strong>Error:</strong> {test.error}
                        </div>
                      )}
                      
                      {test.response_status && (
                        <div className="text-sm text-gray-600">
                          Status: {test.response_status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Show Raw Results
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 