'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  MousePointer, 
  Users, 
  Eye,
  ExternalLink,
  Calendar,
  Filter
} from 'lucide-react'
import type { EmailClickAnalytics, ClickMetrics } from '@/types/email-tracking'

interface EmailClickAnalyticsProps {
  className?: string
}

export function EmailClickAnalytics({ className = '' }: EmailClickAnalyticsProps) {
  const [metrics, setMetrics] = useState<ClickMetrics | null>(null)
  const [analytics, setAnalytics] = useState<EmailClickAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)
  const [filter, setFilter] = useState<'all' | 'template' | 'contact'>('all')
  const [selectedFilter, setSelectedFilter] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, filter, selectedFilter])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ days: timeRange.toString() })
      
      if (filter === 'template' && selectedFilter) {
        params.set('templateId', selectedFilter)
      } else if (filter === 'contact' && selectedFilter) {
        params.set('contactId', selectedFilter)
      }

      const response = await fetch(`/api/emails/analytics?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        if (data.data.type === 'metrics') {
          setMetrics(data.data.data)
        } else if (data.data.type === 'template') {
          setAnalytics(data.data.data)
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-shimmer"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-shimmer"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded animate-shimmer"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Email Click Analytics</h2>
        
        <div className="flex flex-wrap gap-3">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>

          {/* Filter Type */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Emails</option>
            <option value="template">By Template</option>
            <option value="contact">By Contact</option>
          </select>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Clicks"
            value={metrics.total_clicks}
            icon={<MousePointer className="w-5 h-5" />}
            color="blue"
          />
          
          <MetricCard
            title="Unique Clicks"
            value={metrics.unique_clicks}
            icon={<Users className="w-5 h-5" />}
            color="green"
          />
          
          <MetricCard
            title="Click-Through Rate"
            value={`${(metrics.click_through_rate * 100).toFixed(1)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="yellow"
          />
          
          <MetricCard
            title="Avg Daily Clicks"
            value={metrics.time_series.length > 0 
              ? Math.round(metrics.total_clicks / metrics.time_series.length)
              : 0
            }
            icon={<Calendar className="w-5 h-5" />}
            color="purple"
          />
        </div>
      )}

      {/* Time Series Chart */}
      {metrics?.time_series && metrics.time_series.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Click Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.time_series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [value, name === 'clicks' ? 'Total Clicks' : 'Unique Clicks']}
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="clicks"
              />
              <Line 
                type="monotone" 
                dataKey="unique_clicks" 
                stroke="#10B981" 
                strokeWidth={2}
                name="unique_clicks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Most Clicked Links */}
      {metrics?.most_clicked_links && metrics.most_clicked_links.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Clicked Links</h3>
          <div className="space-y-3">
            {metrics.most_clicked_links.slice(0, 10).map((link, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      {link.unique_clicks} unique clicks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {link.click_count} clicks
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click Distribution Chart */}
      {metrics?.most_clicked_links && metrics.most_clicked_links.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Click Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.most_clicked_links.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="url" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => {
                  try {
                    const domain = new URL(value).hostname
                    return domain.length > 15 ? `${domain.substring(0, 15)}...` : domain
                  } catch {
                    return value.length > 15 ? `${value.substring(0, 15)}...` : value
                  }
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === 'click_count' ? 'Total Clicks' : 'Unique Clicks']}
                labelFormatter={(value) => `URL: ${value}`}
              />
              <Bar dataKey="click_count" fill="#3B82F6" />
              <Bar dataKey="unique_clicks" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
} 