'use client'

import { useState, useEffect } from 'react'
import { Trophy, Star, Users, Zap, TrendingUp } from 'lucide-react'
import { useActivityFeedRealtime } from '@/hooks/useRealtime'

interface ActivityItem {
  id: string
  type: 'achievement' | 'milestone' | 'growth' | 'celebration'
  user: {
    name: string
    avatar: string
    initials: string
  }
  message: string
  timestamp: Date
  icon?: React.ReactNode
}

export function TeamActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  
  // Use realtime hook for live activity updates
  const { 
    activities: realtimeActivities, 
    newActivityCount, 
    markActivityAsSeen,
    setActivities: setRealtimeActivities
  } = useActivityFeedRealtime()

  useEffect(() => {
    // Convert realtime activities to display format
    const displayActivities = realtimeActivities.map((activity): ActivityItem => ({
      id: activity.id,
      type: activity.type as any,
      user: {
        name: activity.metadata?.user_name || 'Team Member',
        avatar: '',
        initials: (activity.metadata?.user_name || 'TM').split(' ').map((n: string) => n[0]).join('').toUpperCase()
      },
      message: activity.description,
      timestamp: activity.timestamp,
      icon: getActivityIcon(activity.type)
    }))
    setActivities(displayActivities)
  }, [realtimeActivities])

  const formatTimeAgo = (timestamp: Date) => {
    const diff = Date.now() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'just now'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
      case 'goal_achieved':
        return <Trophy className="w-4 h-4 text-action-golden" />
      case 'milestone':
      case 'milestone_reached':
        return <Star className="w-4 h-4 text-action-purple" />
      case 'growth':
      case 'contact_added':
        return <Users className="w-4 h-4 text-action-blue" />
      case 'celebration':
      case 'training_completed':
        return <Zap className="w-4 h-4 text-action-green" />
      case 'email_sent':
        return <TrendingUp className="w-4 h-4 text-action-coral" />
      default:
        return <Star className="w-4 h-4 text-action-golden" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'achievement': return 'border-l-action-golden bg-yellow-50'
      case 'milestone': return 'border-l-action-purple bg-purple-50'
      case 'growth': return 'border-l-action-blue bg-blue-50'
      case 'celebration': return 'border-l-action-green bg-green-50'
      default: return 'border-l-gray-300 bg-gray-50'
    }
  }

  // Show empty state if no activities
  if (activities.length === 0) {
    return (
      <div className="rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-text-primary">
            Team Wins
          </h3>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-text-primary mb-2">No activities yet</h4>
          <p className="text-sm text-text-secondary">
            Team activities and achievements will appear here as they happen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          Team Wins
        </h3>
        {newActivityCount > 0 && (
          <div 
            className="bg-action-green text-white text-xs px-2 py-1 rounded-full animate-pulse cursor-pointer hover:bg-green-600 transition-colors"
            onClick={markActivityAsSeen}
          >
            {newActivityCount} new
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`
              p-3 rounded-lg border-l-4 transition-all duration-300 hover:shadow-sm
              ${getActivityColor(activity.type)}
              ${index === 0 && newActivityCount > 0 ? 'animate-slide-in' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-action-purple to-action-blue text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {activity.user.initials}
                </div>
                {/* Activity type icon */}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                  {activity.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium text-text-primary">
                      {activity.user.name}
                    </span>{' '}
                    {activity.message}
                  </p>
                </div>
                <p className="text-xs text-text-light mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 