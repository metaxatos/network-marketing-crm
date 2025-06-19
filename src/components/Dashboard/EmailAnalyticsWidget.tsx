'use client'

import { MousePointer, TrendingUp, Mail, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'

interface EmailAnalytics {
  total_emails: number
  total_clicks: number
  click_through_rate: number
  most_clicked_links: Array<{
    url: string
    click_count: number
  }>
}

export function EmailAnalyticsWidget() {
  // Fetch email analytics using React Query
  const { data: analytics, isLoading } = useQuery({
    queryKey: queryKeys.emailAnalytics(),
    queryFn: async (): Promise<EmailAnalytics> => {
      const response = await fetch('/api/emails/analytics?days=7')
      if (!response.ok) {
        throw new Error('Failed to fetch email analytics')
      }
      const data = await response.json()
      return data.analytics
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // Default values if no analytics data
  const emailAnalytics = analytics || {
    total_emails: 0,
    total_clicks: 0,
    click_through_rate: 0,
    most_clicked_links: []
  }

  const hasEmailActivity = emailAnalytics.total_emails > 0

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email Performance</h3>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
          </div>
          <Link
            href="/dashboard/analytics"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-6">
        {hasEmailActivity ? (
          <>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {emailAnalytics.total_emails}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Emails Sent</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MousePointer className="w-4 h-4 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {emailAnalytics.total_clicks}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total Clicks</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-3xl font-bold text-gray-900">
                  {(emailAnalytics.click_through_rate * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-gray-600">Click-through Rate</p>
            </div>

            {/* Top Links Preview */}
            {emailAnalytics.most_clicked_links && emailAnalytics.most_clicked_links.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Top Clicked Links
                </h4>
                <div className="space-y-3">
                  {emailAnalytics.most_clicked_links.slice(0, 3).map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700 truncate flex-1 mr-3">
                        {link.url.replace(/^https?:\/\/(www\.)?/, '').substring(0, 35)}...
                      </span>
                      <div className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-semibold text-blue-600">
                          {link.click_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-8">
            <div className="p-4 bg-blue-50 rounded-full w-16 h-16 mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-500 mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Start Your Email Journey
            </h4>
            <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
              Send your first tracked email to see performance metrics and analytics here.
            </p>
            <Link
              href="/dashboard/emails"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Send First Email
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 