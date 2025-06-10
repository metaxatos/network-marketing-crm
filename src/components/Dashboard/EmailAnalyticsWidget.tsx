'use client'

import { useState, useEffect } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import { MousePointer, TrendingUp, Mail, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export function EmailAnalyticsWidget() {
  const { clickMetrics, loadAnalytics, isLoading } = useEmailStore()
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      loadAnalytics(7) // Load last 7 days
      setHasLoaded(true)
    }
  }, [hasLoaded, isLoading, loadAnalytics])

  if (isLoading || !clickMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4 animate-shimmer"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-shimmer"></div>
          </div>
        </div>
      </div>
    )
  }

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
            href="/analytics"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MousePointer className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">
                {clickMetrics.total_clicks}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Clicks</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">
                {(clickMetrics.click_through_rate * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Click Rate</p>
          </div>
        </div>

        {/* Top Links Preview */}
        {clickMetrics.most_clicked_links && clickMetrics.most_clicked_links.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Top Links</h4>
            <div className="space-y-2">
              {clickMetrics.most_clicked_links.slice(0, 3).map((link: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                    {link.url.replace(/^https?:\/\//, '').substring(0, 30)}...
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {link.click_count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!clickMetrics.most_clicked_links || clickMetrics.most_clicked_links.length === 0) && (
          <div className="border-t border-gray-100 pt-4 text-center">
            <Mail className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No clicks yet. Send your first tracked email!
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 