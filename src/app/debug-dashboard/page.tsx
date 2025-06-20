'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DebugDashboardPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/debug/dashboard-debug')
      const data = await response.json()
      setResults(data)
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'text-green-600 bg-green-50'
      case 'FAILED': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Debug Tests</h1>
        <p className="text-gray-600 mb-6">
          Run comprehensive tests to identify why the dashboard is not loading properly.
        </p>
        
        <Button 
          onClick={runTests} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Running Tests...' : 'Run Dashboard Tests'}
        </Button>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Test Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{results.testsRun || 0}</div>
                <div className="text-sm text-gray-600">Tests Run</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{results.testsPassed || 0}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{results.testsFailed || 0}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{results.totalTime}</div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {results.recommendations && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
              <div className="space-y-2">
                {results.recommendations.map((rec: string, index: number) => (
                  <div 
                    key={index}
                    className={`p-3 rounded ${rec.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                  >
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Test Results */}
          {results.tests && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Detailed Test Results</h2>
              <div className="space-y-4">
                {Object.entries(results.tests).map(([testName, testResult]: [string, any]) => (
                  <div key={testName} className="border rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">{testName}</h3>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(testResult.status)}`}>
                        {testResult.status}
                      </span>
                    </div>
                    
                    {testResult.error && (
                      <div className="text-red-600 text-sm mb-2">
                        <strong>Error:</strong> {testResult.error}
                      </div>
                    )}
                    
                    {testResult.httpStatus && (
                      <div className="text-gray-600 text-sm mb-2">
                        <strong>HTTP Status:</strong> {testResult.httpStatus}
                      </div>
                    )}
                    
                    {testResult.responseTime && (
                      <div className="text-gray-600 text-sm mb-2">
                        <strong>Response Time:</strong> {testResult.responseTime}
                      </div>
                    )}
                    
                    {testResult.count !== undefined && (
                      <div className="text-gray-600 text-sm mb-2">
                        <strong>Count:</strong> {testResult.count}
                      </div>
                    )}
                    
                    {testResult.userId && (
                      <div className="text-gray-600 text-sm mb-2">
                        <strong>User ID:</strong> {testResult.userId}
                      </div>
                    )}
                    
                    {testResult.memberId && (
                      <div className="text-gray-600 text-sm mb-2">
                        <strong>Member ID:</strong> {testResult.memberId}
                      </div>
                    )}
                    
                    {testResult.companyId && (
                      <div className="text-gray-600 text-sm mb-2">
                        <strong>Company ID:</strong> {testResult.companyId}
                      </div>
                    )}
                    
                    {testResult.tables && (
                      <div className="text-gray-600 text-sm">
                        <strong>Database Tables:</strong>
                        <div className="ml-4 mt-1 space-y-1">
                          {Object.entries(testResult.tables).map(([tableName, tableData]: [string, any]) => (
                            <div key={tableName}>
                              {tableName}: {tableData.error ? `Error - ${tableData.error}` : `${tableData.count} rows`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {testResult.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600">Show raw data</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(testResult.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Details */}
          {!results.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">Error Details</h2>
              <div className="text-red-700">
                <strong>Error:</strong> {results.error}
              </div>
              <div className="text-red-600 text-sm mt-2">
                <strong>Timestamp:</strong> {results.timestamp}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 