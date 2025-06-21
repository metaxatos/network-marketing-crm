'use client'

import { useState } from 'react'

export default function TestEmailSendPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testPayload = async () => {
    setLoading(true)
    try {
      const testData = {
        templateId: 'test-template-id',
        contactIds: ['contact-1', 'contact-2'],
        customSubject: 'Test Subject',
        to: ['test@example.com']
      }

      console.log('Sending test payload:', testData)

      const response = await fetch('/api/debug-email-payload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()
      console.log('Debug result:', result)
      setResults(result)
    } catch (error) {
      console.error('Test failed:', error)
      setResults({ error: 'Test failed', details: error })
    } finally {
      setLoading(false)
    }
  }

  const testActualEmail = async () => {
    setLoading(true)
    try {
      const testData = {
        templateId: 'test-template-id',
        contactIds: ['contact-1', 'contact-2'],
        customSubject: 'Test Subject'
      }

      console.log('Testing actual email API:', testData)

      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()
      console.log('Email API result:', result)
      setResults(result)
    } catch (error) {
      console.error('Email test failed:', error)
      setResults({ error: 'Email test failed', details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Email Send Test
          </h1>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={testPayload}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 mr-4"
            >
              {loading ? 'Testing...' : 'Test Debug Endpoint'}
            </button>
            
            <button
              onClick={testActualEmail}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Actual Email API'}
            </button>
          </div>

          {results && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Test Results</h2>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm text-gray-600 overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 