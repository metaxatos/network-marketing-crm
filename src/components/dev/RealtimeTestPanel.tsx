'use client'

import { useState } from 'react'
import { useRealtimeConnection } from '@/hooks/useRealtime'
import { Zap, Database, Users, Mail, Activity, Wifi, WifiOff } from 'lucide-react'

export function RealtimeTestPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const { status, isConnected } = useRealtimeConnection()
  const [isLoading, setIsLoading] = useState(false)

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
        throw new Error('Failed to add contact')
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
      // This would normally require a template and contact ID
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
      const activities = [
        { activity_type: 'goal_achieved', metadata: { goal_name: 'Weekly Target' } },
        { activity_type: 'training_completed', metadata: { course_title: 'Advanced Sales' } },
        { activity_type: 'milestone_reached', metadata: { milestone_name: '100 Contacts' } }
      ]
      
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      
      const response = await fetch('/api/dashboard/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...randomActivity,
          metadata: { ...randomActivity.metadata, test: true }
        })
      })
      
      console.log('🎯 Test activity created - should trigger realtime update')
    } catch (error) {
      console.error('❌ Failed to add test activity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Open Realtime Test Panel"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Realtime Test Panel
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-gray-50">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-700">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">Disconnected</span>
          </>
        )}
        <span className="text-xs text-gray-500 ml-auto">{status}</span>
      </div>

      {/* Test Actions */}
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
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Use these buttons to test realtime updates. Check the browser console for logs.
      </div>
    </div>
  )
} 