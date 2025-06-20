'use client'

import { useState } from 'react'

export default function TestSignupPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [endpoint, setEndpoint] = useState('/api/auth/signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('Test123!')

  const generateEmail = () => {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    return `user_${timestamp}_${randomStr}@gmail.com`
  }

  const testSignup = async () => {
    setLoading(true)
    setResult(null)
    
    const testEmail = email || generateEmail()
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: password,
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser' + Date.now(),
        }),
      })
      
      const data = await response.json()
      
      setResult({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
        testData: {
          email: testEmail,
          password: password
        }
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
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Endpoint</label>
            <select 
              value={endpoint} 
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {testEndpoints.map(ep => (
                <option key={ep} value={ep}>{ep}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email (leave empty for auto-generated)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500 mt-1">
              Auto-generates realistic Gmail address if empty
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
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
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">📌 Important Notes</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Supabase might reject common test emails like test@example.com</li>
            <li>Use a realistic email format (e.g., user123@gmail.com)</li>
            <li>Check Supabase Auth settings for email confirmation requirements</li>
            <li>Some domains might be blacklisted in production</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
