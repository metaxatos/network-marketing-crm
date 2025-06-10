import { useEffect, useRef, useState } from 'react'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useAppAuth } from './useAuth'
import { 
  createRealtimeSubscription, 
  createMultipleSubscriptions,
  RealtimeConnection,
  SubscriptionConfig,
  DatabaseEvent
} from '@/lib/realtime'

/**
 * Hook for managing a single realtime subscription
 */
export function useRealtimeSubscription(
  table: string,
  event: DatabaseEvent,
  callback: (payload: RealtimePostgresChangesPayload<any>) => void,
  options?: {
    filter?: string
    enabled?: boolean
  }
) {
  const { user } = useAppAuth()
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    if (!user || options?.enabled === false) {
      return
    }

    const channelName = `${table}_${event}_${user.id}`
    const subscription = createRealtimeSubscription(channelName, {
      table,
      event,
      filter: options?.filter || `member_id=eq.${user.id}`,
      callback
    })

    subscriptionRef.current = subscription

    return () => {
      subscription.unsubscribe()
    }
  }, [user, table, event, options?.filter, options?.enabled, callback])

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])
}

/**
 * Hook for managing multiple realtime subscriptions
 */
export function useMultipleRealtimeSubscriptions(
  subscriptions: Array<{
    table: string
    event: DatabaseEvent
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
    filter?: string
  }>,
  enabled: boolean = true
) {
  const { user } = useAppAuth()
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!user || !enabled) {
      return
    }

    const configs = subscriptions.map((sub, index) => ({
      name: `${sub.table}_${sub.event}_${user.id}_${index}`,
      config: {
        table: sub.table,
        event: sub.event,
        filter: sub.filter || `member_id=eq.${user.id}`,
        callback: sub.callback
      }
    }))

    const cleanup = createMultipleSubscriptions(configs)
    cleanupRef.current = cleanup

    return cleanup
  }, [user, enabled, subscriptions])

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])
}

/**
 * Hook for tracking realtime connection status
 */
export function useRealtimeConnection() {
  const [status, setStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('DISCONNECTED')
  const connectionRef = useRef<RealtimeConnection | null>(null)

  useEffect(() => {
    const connection = RealtimeConnection.getInstance()
    connectionRef.current = connection

    const unsubscribe = connection.onStatusChange((newStatus) => {
      setStatus(newStatus)
    })

    return unsubscribe
  }, [])

  return {
    status,
    isConnected: status === 'CONNECTED',
    isReconnecting: status === 'RECONNECTING',
    isDisconnected: status === 'DISCONNECTED'
  }
}

/**
 * Hook for dashboard realtime updates
 */
export function useDashboardRealtime() {
  const { user } = useAppAuth()
  const [contactCount, setContactCount] = useState<number | null>(null)
  const [emailCount, setEmailCount] = useState<number | null>(null)
  const [activityCount, setActivityCount] = useState<number | null>(null)

  // Contact updates
  useRealtimeSubscription(
    'contacts',
    '*',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setContactCount(prev => prev !== null ? prev + 1 : null)
      } else if (payload.eventType === 'DELETE') {
        setContactCount(prev => prev !== null ? Math.max(0, prev - 1) : null)
      }
    }
  )

  // Email updates
  useRealtimeSubscription(
    'sent_emails',
    'INSERT',
    (payload) => {
      setEmailCount(prev => prev !== null ? prev + 1 : null)
    }
  )

  // Activity updates
  useRealtimeSubscription(
    'member_activities',
    'INSERT',
    (payload) => {
      setActivityCount(prev => prev !== null ? prev + 1 : null)
    }
  )

  // Initialize counts
  useEffect(() => {
    if (!user) return

    const initializeCounts = async () => {
      try {
        // Fetch current counts
        const [contactRes, emailRes, activityRes] = await Promise.all([
          fetch('/api/contacts').then(r => r.json()),
          fetch('/api/emails/history').then(r => r.json()),
          fetch('/api/dashboard/activities').then(r => r.json())
        ])

        if (contactRes.contacts) {
          setContactCount(contactRes.contacts.length)
        }
        if (emailRes.emails) {
          setEmailCount(emailRes.emails.length)
        }
        if (activityRes.activities) {
          setActivityCount(activityRes.activities.length)
        }
      } catch (error) {
        console.error('Failed to initialize counts:', error)
      }
    }

    initializeCounts()
  }, [user])

  return {
    contactCount,
    emailCount,
    activityCount,
    setContactCount,
    setEmailCount,
    setActivityCount
  }
}

/**
 * Hook for activity feed realtime updates
 */
export function useActivityFeedRealtime(
  onNewActivity?: (activity: any) => void
) {
  const [activities, setActivities] = useState<any[]>([])
  const [newActivityCount, setNewActivityCount] = useState(0)

  useRealtimeSubscription(
    'member_activities',
    'INSERT',
    (payload) => {
      const newActivity = {
        id: payload.new.id,
        type: payload.new.activity_type,
        description: getActivityDescription(payload.new),
        timestamp: new Date(payload.new.created_at),
        metadata: payload.new.metadata,
        member_id: payload.new.member_id
      }

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]) // Keep only 10 most recent
      setNewActivityCount(prev => prev + 1)
      
      if (onNewActivity) {
        onNewActivity(newActivity)
      }
    }
  )

  const markActivityAsSeen = () => {
    setNewActivityCount(0)
  }

  return {
    activities,
    newActivityCount,
    markActivityAsSeen,
    setActivities
  }
}

// Helper function to format activity descriptions
function getActivityDescription(activity: any): string {
  switch (activity.activity_type) {
    case 'contact_added':
      return `Added new contact${activity.metadata?.contact_name ? `: ${activity.metadata.contact_name}` : ''}`
    case 'email_sent':
      return `Sent email${activity.metadata?.contact_name ? ` to ${activity.metadata.contact_name}` : ''}`
    case 'training_completed':
      return `Completed training${activity.metadata?.course_title ? `: ${activity.metadata.course_title}` : ''}`
    case 'goal_achieved':
      return `Achieved goal${activity.metadata?.goal_name ? `: ${activity.metadata.goal_name}` : ''}`
    case 'milestone_reached':
      return `Reached milestone${activity.metadata?.milestone_name ? `: ${activity.metadata.milestone_name}` : ''}`
    case 'login':
      return 'Logged in'
    case 'logout':
      return 'Logged out'
    case 'signup':
      return 'Created account'
    default:
      return activity.activity_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  }
} 