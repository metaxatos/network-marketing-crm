'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function DebugAuthPage() {
  const [status, setStatus] = useState<any>({
    loading: true,
    supabaseUrl: null,
    supabaseKey: null,
    appUrl: null,
    connectionTest: null,
    authTest: null,
    error: null,
  })

  useEffect(() => {
    async function checkStatus() {
      try {
        // Check environment variables
        const envStatus = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not Set',
        }

        // Test Supabase connection
        let connectionTest = 'Failed'
        let authTest = 'Not tested'
        
        try {
          const { data, error } = await supabase.from('members').select('count').limit(1)
          if (!error) {
            connectionTest = 'Success'
          } else {
            connectionTest = `Failed: ${error.message}`
          }
        } catch (e: any) {
          connectionTest = `Error: ${e.message}`
        }

        // Test auth status
        try {
          const { data: { session } } = await supabase.auth.getSession()
          authTest = session ? 'Authenticated' : 'Not authenticated'
        } catch (e: any) {
          authTest = `Error: ${e.message}`
        }

        setStatus({
          loading: false,
          ...envStatus,
          connectionTest,
          authTest,
          error: null,
        })
      } catch (error: any) {
        setStatus({
          loading: false,
          error: error.message,
        })
      }
    }

    checkStatus()
  }, [])

  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Checking Authentication Status...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Page</h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={status.supabaseUrl === 'Set' ? 'text-green-600' : 'text-red-600'}>
                  {status.supabaseUrl}
                </span>
              </div>
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={status.supabaseKey === 'Set' ? 'text-green-600' : 'text-red-600'}>
                  {status.supabaseKey}
                </span>
              </div>
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_APP_URL:</span>
                <span>{status.appUrl}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Tests</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Supabase Connection:</span>
                <span className={status.connectionTest === 'Success' ? 'text-green-600' : 'text-red-600'}>
                  {status.connectionTest}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Auth Status:</span>
                <span>{status.authTest}</span>
              </div>
            </div>
          </div>

          {status.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold">Error:</h3>
              <p className="text-red-600">{status.error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-blue-800 font-semibold">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700 mt-2">
              <li>If environment variables are missing, add them in Netlify dashboard</li>
              <li>After adding variables, redeploy your site</li>
              <li>Visit this page again to verify everything is working</li>
              <li>Once all checks pass, try logging in again</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
