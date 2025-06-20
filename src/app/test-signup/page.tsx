'use client'

import { useState } from 'react'

export default function TestSignupPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [endpoint, setEndpoint] = useState('/api/auth/signup')

  const testSignup = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser' + Date.now(), // Make it unique
        }),
      })
      
      const data = await response.json()
      
      setResult({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error: any) {
      setResult({
        error: error.message,
        stack: error.stack
      })
    } finally {
      setLoading(false)
    }
  }

  const testEndpoints = [
    '/api/auth/signup',
    '/api/auth/signup-v2',
    '/api/debug-signup-test',
    '/api/basic-test',
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Signup Endpoint Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Endpoint</h2>
          <select 
            value={endpoint} 
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            {testEndpoints.map(ep => (
              <option key={ep} value={ep}>{ep}</option>
            ))}
          </select>
          
          <button
            onClick={testSignup}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Signup'}
          </button>
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
{`{
  "email": "test@example.com",
  "password": "Test123!",
  "firstName": "Test",
  "lastName": "User",
  "username": "testuser" + Date.now()
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
