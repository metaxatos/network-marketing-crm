'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectAuth = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Test direct Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      setResult({
        success: !error,
        data: data,
        error: error,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      setResult({
        success: false,
        error: err,
        message: 'Caught exception',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    setResult({
      session,
      error,
      timestamp: new Date().toISOString(),
    })
  }

  const checkEnv = () => {
    setResult({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Authentication Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Direct Authentication</h2>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            
            <div className="flex gap-2">
              <button
                onClick={testDirectAuth}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Direct Auth'}
              </button>
              
              <button
                onClick={checkSession}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Check Session
              </button>
              
              <button
                onClick={checkEnv}
                className="px-4 py-2 bg-purple-500 text-white rounded"
              >
                Check Env
              </button>
            </div>
          </div>
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
