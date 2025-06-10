'use client'

import { useState, useEffect } from 'react'
import { useEmailStore } from '@/stores/emailStore'
import {
  Mail,
  MousePointer,
  Eye,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  Filter,
  X
} from 'lucide-react'
import type { SentEmail } from '@/types'
import type { EmailClickAnalytics } from '@/types/email-tracking'

interface EmailPerformanceProps {
  className?: string
}

export function EmailPerformance({ className = '' }: EmailPerformanceProps) {
  const { sentEmails, loadSentEmails, getEmailAnalytics } = useEmailStore()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [emailAnalytics, setEmailAnalytics] = useState<EmailClickAnalytics | null>(null)
  const [filterTemplate, setFilterTemplate] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      await loadSentEmails()
    } catch (error) {
      console.error('Failed to load sent emails:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEmailAnalytics = async (emailId: string) => {
    try {
      const analytics = await getEmailAnalytics(emailId)
      setEmailAnalytics(analytics)
      setSelectedEmail(emailId)
    } catch (error) {
      console.error('Failed to load email analytics:', error)
    }
  }

  const uniqueTemplates = Array.from(
    new Set(sentEmails.map(email => email.subject).filter(Boolean))
  )

  const filteredEmails = filterTemplate === 'all' 
    ? sentEmails 
    : sentEmails.filter(email => email.subject === filterTemplate)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Email Performance</h3>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Templates</option>
            {uniqueTemplates.map(template => (
              <option key={template} value={template}>{template}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Email List */}
      <div className="space-y-3">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No emails found for the selected filter</p>
          </div>
        ) : (
          filteredEmails.slice(0, 20).map((email) => (
            <EmailPerformanceCard
              key={email.id}
              email={email}
              onClick={() => loadEmailAnalytics(email.id)}
              isSelected={selectedEmail === email.id}
            />
          ))
        )}
      </div>

      {/* Detailed Analytics Modal/Panel */}
      {selectedEmail && emailAnalytics && (
        <EmailAnalyticsPanel
          email={sentEmails.find(e => e.id === selectedEmail)!}
          analytics={emailAnalytics}
          onClose={() => {
            setSelectedEmail(null)
            setEmailAnalytics(null)
          }}
        />
      )}
    </div>
  )
}

interface EmailPerformanceCardProps {
  email: SentEmail
  onClick: () => void
  isSelected: boolean
}

function EmailPerformanceCard({ email, onClick, isSelected }: EmailPerformanceCardProps) {
  // Calculate basic metrics from email data - these would come from analytics API
  const clickCount = 0 // Will be updated when analytics are loaded
  const openCount = email.opened_at ? 1 : 0
  const ctr = openCount > 0 ? (clickCount / openCount * 100) : 0

  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {email.subject || 'No Subject'}
              </h4>
              <p className="text-sm text-gray-500">
                To: Contact {email.contact_id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {email.sent_at ? formatDate(email.sent_at) : 'Pending'}
            </span>
            <span className="flex items-center gap-1">
              <MousePointer className="w-4 h-4" />
              {clickCount} clicks
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {ctr.toFixed(1)}% CTR
            </span>
          </div>
        </div>
        
        <ExternalLink className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  )
}

interface EmailAnalyticsPanelProps {
  email: SentEmail
  analytics: EmailClickAnalytics
  onClose: () => void
}

function EmailAnalyticsPanel({ email, analytics, onClose }: EmailAnalyticsPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Email Analytics</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Email Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">
              {email.subject || 'No Subject'}
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>To: Contact {email.contact_id}</p>
              <p>Sent: {email.sent_at ? formatDate(email.sent_at) : 'Pending'}</p>
              <p>Template ID: {email.template_id || 'None'}</p>
            </div>
          </div>

          {/* Analytics Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Total Clicks</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.total_clicks}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Unique Clicks</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {analytics.unique_clicks}
              </p>
            </div>
          </div>

          {/* Click Timeline */}
          {analytics.clicks && analytics.clicks.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Click Timeline</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {analytics.clicks.map((click, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{click.url}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(click.clicked_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clicked Links Summary */}
          {analytics.clicks && analytics.clicks.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Clicked Links</h4>
              <div className="space-y-2">
                {analytics.clicks.slice(0, 5).map((click, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium truncate flex-1 mr-2">
                      {click.url}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {new Date(click.clicked_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
} 