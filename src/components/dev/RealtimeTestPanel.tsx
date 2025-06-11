'use client'

import { useState, useEffect } from 'react'
import { useRealtimeConnection } from '@/hooks/useRealtime'
import { getActiveChannels, cleanupAllChannels } from '@/lib/realtime'
import { Zap, Database, Users, Mail, Activity, Wifi, WifiOff, AlertTriangle, Bug } from 'lucide-react'
import { RealtimeConnection } from '@/lib/realtime'

export function RealtimeTestPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const { status, isConnected, isReconnecting } = useRealtimeConnection()
  const [isLoading, setIsLoading] = useState(false)
  const [activeChannels, setActiveChannels] = useState<string[]>([])
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const [lastActivity, setLastActivity] = useState<string | null>(null)
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    timestamp: string
    event: string
    status: string
  }>>([])

  // Update active channels periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChannels(getActiveChannels())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Gather debug info
  useEffect(() => {
    const info = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      userAgent: navigator.userAgent.substring(0, 50) + '...',
      webSocketSupport: 'WebSocket' in window,
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
  }, [])

  useEffect(() => {
    const connection = RealtimeConnection.getInstance()
    
    // Track subscription count
    const updateCount = () => {
      const count = connection.getActiveSubscriptionsCount()
      setSubscriptionCount(count)
    }
    
    // Track connection events
    const trackEvent = (event: string, status: string) => {
      const entry = {
        timestamp: new Date().toLocaleTimeString(),
        event,
        status
      }
      setConnectionHistory(prev => [entry, ...prev.slice(0, 9)]) // Keep last 10
    }

    // Monitor status changes
    const unsubscribeStatus = connection.onStatusChange((newStatus) => {
      trackEvent('Status Change', newStatus)
    })

    // Initial count
    updateCount()
    
    // Update count every 2 seconds
    const interval = setInterval(updateCount, 2000)

    return () => {
      unsubscribeStatus()
      clearInterval(interval)
    }
  }, [])

  const triggerContactAdd = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test Contact ${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          status: 'lead',
          tags: ['test']
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to add contact: ${response.status}`)
      }
      
      console.log('✅ Test contact added - should trigger realtime update')
    } catch (error) {
      console.error('❌ Failed to add test contact:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerEmailSend = async () => {
    setIsLoading(true)
    try {
      console.log('📧 Email send test - would trigger realtime update')
      
      // Simulate activity creation instead
      const response = await fetch('/api/dashboard/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'email_sent',
          metadata: { contact_name: 'Test Contact', test: true }
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create activity: ${response.status}`)
      }
      
      console.log('📊 Activity logged for email test')
    } catch (error) {
      console.error('❌ Failed to trigger email test:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerActivity = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'test_activity',
          metadata: { 
            test: true, 
            timestamp: new Date().toISOString(),
            description: 'Test activity from realtime panel'
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create activity: ${response.status}`)
      }
      
      console.log('🎯 Test activity created - should trigger realtime update')
    } catch (error) {
      console.error('❌ Failed to create test activity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const forceCleanup = () => {
    console.log('🧹 Force cleaning up all channels...')
    cleanupAllChannels()
    setActiveChannels([])
  }

  const handleManualReconnect = () => {
    const connection = RealtimeConnection.getInstance()
    connection.reconnect()
    setLastActivity('Manual reconnect triggered')
  }

  const handleClearHistory = () => {
    setConnectionHistory([])
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition-colors z-50"
        title="Open Realtime Debug Panel"
      >
        <Zap className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-800">Realtime Debug</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            Status: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {status}
            </span>
          </span>
        </div>

        {/* Active Channels */}
        <div className="text-xs text-gray-600 mb-2">
          Active Channels: {activeChannels.length}
        </div>
        {activeChannels.length > 0 && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
            {activeChannels.map((channel, i) => (
              <div key={i} className="truncate">{channel}</div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div className="mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-1 mb-1">
          <Bug className="w-3 h-3" />
          <span className="font-medium">Debug Info:</span>
        </div>
        <div className="bg-gray-50 p-2 rounded space-y-1">
          <div>URL: {debugInfo.supabaseUrl}</div>
          <div>Key: {debugInfo.hasAnonKey ? '✓ Present' : '❌ Missing'}</div>
          <div>WebSocket: {debugInfo.webSocketSupport ? '✓ Supported' : '❌ Not supported'}</div>
        </div>
      </div>

      {/* Warning for disconnected state */}
      {!isConnected && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Realtime disconnected. Check network and Supabase settings.</span>
          </div>
        </div>
      )}

      {/* Test Buttons */}
      <div className="space-y-2">
        <button
          onClick={triggerContactAdd}
          disabled={isLoading || !isConnected}
          className="w-full flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Users className="w-4 h-4" />
          Add Test Contact
        </button>

        <button
          onClick={triggerEmailSend}
          disabled={isLoading || !isConnected}
          className="w-full flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Mail className="w-4 h-4" />
          Test Email Event
        </button>

        <button
          onClick={triggerActivity}
          disabled={isLoading || !isConnected}
          className="w-full flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Activity className="w-4 h-4" />
          Add Test Activity
        </button>

        <button
          onClick={forceCleanup}
          className="w-full flex items-center gap-2 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Database className="w-4 h-4" />
          Force Cleanup Channels
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Use these buttons to test realtime updates. Check the browser console for detailed logs.
        {activeChannels.length > 5 && (
          <div className="text-orange-600 mt-1">
            ⚠️ Many active channels detected. Consider cleanup.
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-700">Realtime Monitor</h4>
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 
            isReconnecting ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`}></div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${
              isConnected ? 'text-green-600' : 
              isReconnecting ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {status}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Active Subscriptions:</span>
            <span className="font-medium text-blue-600">{subscriptionCount}</span>
          </div>
          
          {lastActivity && (
            <div className="flex justify-between">
              <span className="text-gray-600">Last Activity:</span>
              <span className="font-medium text-purple-600 truncate max-w-32">{lastActivity}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={handleManualReconnect}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs font-medium"
        >
          Manual Reconnect
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={handleClearHistory}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs font-medium"
        >
          Clear Connection Log
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Use these buttons to test realtime updates. Check the browser console for detailed logs.
        {activeChannels.length > 5 && (
          <div className="text-orange-600 mt-1">
            ⚠️ Many active channels detected. Consider cleanup.
          </div>
        )}
      </div>
    </div>
  )
} 