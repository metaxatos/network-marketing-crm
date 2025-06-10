'use client'

import { useEffect, useState } from 'react'
import { useAppAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/stores/userStore'
import { useContactStoreCompat } from '@/stores/contactStore'
import { useEmailStore } from '@/stores/emailStore'
import { useTrainingStore } from '@/stores/training-store'

export default function TestAPIPage() {
  const { user, isAuthenticated, loading } = useAppAuth()
  const { metrics, activities } = useUserStore()
  const { contacts, isLoading: contactsLoading } = useContactStoreCompat()
  const { templates, sentEmails, isLoading: emailsLoading } = useEmailStore()
  const { courses, isLoading: trainingLoading } = useTrainingStore()

  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    if (isAuthenticated) {
      addTestResult('✅ User is authenticated')
      addTestResult(`📧 User email: ${user?.email}`)
    } else {
      addTestResult('❌ User not authenticated')
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (metrics) {
      addTestResult(`📊 Dashboard metrics loaded: ${metrics.contacts_this_week} contacts this week`)
    }
  }, [metrics])

  useEffect(() => {
    if (activities.length > 0) {
      addTestResult(`📋 Activities loaded: ${activities.length} recent activities`)
    }
  }, [activities])

  useEffect(() => {
    if (!contactsLoading && contacts.length >= 0) {
      addTestResult(`👥 Contacts loaded: ${contacts.length} contacts found`)
    }
  }, [contacts, contactsLoading])

  useEffect(() => {
    if (!emailsLoading && templates.length >= 0) {
      addTestResult(`📧 Email templates loaded: ${templates.length} templates available`)
    }
  }, [templates, emailsLoading])

  useEffect(() => {
    if (!emailsLoading && sentEmails.length >= 0) {
      addTestResult(`📤 Sent emails loaded: ${sentEmails.length} emails in history`)
    }
  }, [sentEmails, emailsLoading])

  useEffect(() => {
    if (!trainingLoading && courses.length >= 0) {
      addTestResult(`🎓 Training courses loaded: ${courses.length} courses available`)
    }
  }, [courses, trainingLoading])

  const testAddContact = async () => {
    const { addContact } = useContactStoreCompat()
    
    const result = await addContact({
      name: 'Test Contact',
      email: 'test@example.com',
      phone: '+1234567890',
      status: 'lead',
      tags: ['test'],
      custom_fields: {}
    })

    if (result.success) {
      addTestResult('✅ Contact added successfully')
    } else {
      addTestResult(`❌ Failed to add contact: ${result.error}`)
    }
  }

  // const testSendEmail = async () => {
  //   if (templates.length === 0 || contacts.length === 0) {
  //     addTestResult('❌ Need both templates and contacts to test email sending')
  //     return
  //   }

  //   const { sendEmail } = useEmailStore.getState()
    
  //   const result = await sendEmail({
  //     templateId: templates[0].id,
  //     contactId: contacts[0].id,
  //     customVariables: { testVar: 'test value' }
  //   })

  //   if (result.success) {
  //     addTestResult('✅ Email sent successfully')
  //   } else {
  //     addTestResult(`❌ Failed to send email: ${result.error}`)
  //   }
  // }

  const testSendEmail = () => {
    addTestResult('❌ Email test temporarily disabled')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
                      <div className="w-12 h-12 bg-purple-200 rounded-lg mx-auto mb-4 animate-shimmer"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">API Integration Test</h1>
        
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p>Authenticated: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? 'Yes' : 'No'}</span></p>
            {user && (
              <>
                <p>Email: {user.email}</p>
                <p>User ID: {user.id}</p>
              </>
            )}
          </div>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700">Contacts</h3>
            <p className="text-2xl font-bold text-blue-600">{contactsLoading ? '...' : contacts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700">Email Templates</h3>
            <p className="text-2xl font-bold text-green-600">{emailsLoading ? '...' : templates.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700">Sent Emails</h3>
            <p className="text-2xl font-bold text-purple-600">{emailsLoading ? '...' : sentEmails.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700">Courses</h3>
            <p className="text-2xl font-bold text-orange-600">{trainingLoading ? '...' : courses.length}</p>
          </div>
        </div>

        {/* Test Actions */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-x-4">
              <button
                onClick={testAddContact}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Test Add Contact
              </button>
              <button
                onClick={testSendEmail}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                disabled={true}
              >
                Test Send Email (Disabled)
              </button>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 