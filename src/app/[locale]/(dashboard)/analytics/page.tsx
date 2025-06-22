'use client'

import { useAppAuth } from '@/hooks/useAuth'
import { EmailClickAnalytics } from '@/components/Analytics/EmailClickAnalytics'
import { EmailPerformance } from '@/components/Analytics/EmailPerformance'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { 
  BarChart3, 
  MousePointer, 
  TrendingUp, 
  Users,
  Mail,
  Eye
} from 'lucide-react'

export default function AnalyticsPage() {
  const { user, loading } = useAppAuth()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Please log in to view analytics</h2>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Email Analytics
            </h1>
            <p className="text-gray-600">
              Track email engagement and click-through rates
            </p>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="space-y-8">
          <EmailClickAnalytics />
          <EmailPerformance />
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Understanding Your Email Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MousePointer className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Total Clicks</h4>
                  <p className="text-sm text-blue-700">
                    Total number of link clicks across all your emails
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Unique Clicks</h4>
                  <p className="text-sm text-blue-700">
                    Number of unique contacts who clicked your links
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Click-Through Rate</h4>
                  <p className="text-sm text-blue-700">
                    Percentage of unique clicks vs. total clicks
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Engagement Tracking</h4>
                  <p className="text-sm text-blue-700">
                    Monitor which links and content perform best
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 