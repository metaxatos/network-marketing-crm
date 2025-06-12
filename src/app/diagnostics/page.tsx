'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const userStore = useUserStore()

  const runDiagnostics = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // 1. Check Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      results.session = {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      }

      // 2. Check user store
      results.userStore = {
        user: !!userStore.user,
        member: !!userStore.member,
        profile: !!userStore.profile,
        company: !!userStore.company,
        isAuthenticated: userStore.isAuthenticated,
        isLoading: userStore.isLoading,
      }

      // 3. Test API endpoints
      try {
        const testDbStart = Date.now()
        const testDbResponse = await fetch('/api/test-db')
        const testDbData = await testDbResponse.json()
        results.testDb = {
          status: testDbResponse.status,
          success: testDbData.success,
          duration: testDbData.duration || (Date.now() - testDbStart),
          data: testDbData,
        }
      } catch (e: any) {
        results.testDb = { error: e.message }
      }

      // 4. Test simplified user endpoint
      try {
        const userSimpleStart = Date.now()
        const userSimpleResponse = await fetch('/api/auth/user-simple')
        const userSimpleData = await userSimpleResponse.json()
        results.userSimple = {
          status: userSimpleResponse.status,
          duration: Date.now() - userSimpleStart,
          hasUser: !!userSimpleData.user,
          hasMember: !!userSimpleData.member,
          hasProfile: !!userSimpleData.profile,
          hasCompany: !!userSimpleData.company,
          error: userSimpleData.error,
        }
      } catch (e: any) {
        results.userSimple = { error: e.message }
      }

      // 5. Test original user endpoint
      try {
        const userStart = Date.now()
        const userResponse = await fetch('/api/auth/user')
        const userData = await userResponse.json()
        results.userOriginal = {
          status: userResponse.status,
          duration: Date.now() - userStart,
          hasUser: !!userData.user,
          hasMember: !!userData.member,
          hasProfile: !!userData.profile,
          hasCompany: !!userData.company,
          error: userData.error,
        }
      } catch (e: any) {
        results.userOriginal = { error: e.message }
      }

      // 6. Check environment
      results.environment = {
        host: window.location.host,
        protocol: window.location.protocol,
        userAgent: navigator.userAgent,
      }

    } catch (error: any) {
      results.error = error.message
    }

    setDiagnostics(results)
    setLoading(false)
  }

  const reinitializeUser = async () => {
    setLoading(true)
    try {
      await userStore.initialize()
      alert('User store reinitialized')
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    }
    setLoading(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">System Diagnostics</h1>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? 'Running...' : 'Run Diagnostics'}
          </Button>
          <Button onClick={reinitializeUser} variant="outline" disabled={loading}>
            Reinitialize User Store
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(diagnostics.session || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Store State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(diagnostics.userStore || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test DB Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(diagnostics.testDb || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simplified User Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(diagnostics.userSimple || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Original User Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(diagnostics.userOriginal || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(diagnostics.environment || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
