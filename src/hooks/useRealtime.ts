import { useEffect, useRef, useState, useCallback } from 'react'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useAppAuth } from './useAuth'
import { 
  createRealtimeSubscription, 
  createMultipleSubscriptions,
  RealtimeConnection,
  SubscriptionConfig,
  DatabaseEvent
} from '@/lib/realtime'

// Temporary flag to disable realtime if causing connection issues
const DISABLE_REALTIME = true // Set to true to temporarily disable realtime

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
    channelSuffix?: string
  }
) {
  const { user } = useAppAuth()
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  
  // Stabilize the callback to prevent re-subscriptions
  const stableCallback = useCallback(callback, [])

  useEffect(() => {
    if (!user || options?.enabled === false || DISABLE_REALTIME) {
      return
    }

    // Include channelSuffix for uniqueness
    const suffix = options?.channelSuffix ? `_${options.channelSuffix}` : ''
    const channelName = `${table}_${event}_${user.id}${suffix}`
    
    // Clean up existing subscription before creating new one
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }
    
    const subscription = createRealtimeSubscription(channelName, {
      table,
      event,
      filter: options?.filter || `member_id=eq.${user.id}`,
      callback: stableCallback
    })

    subscriptionRef.current = subscription

    return () => {
      subscription.unsubscribe()
      subscriptionRef.current = null
    }
  }, [user, table, event, options?.filter, options?.enabled, options?.channelSuffix, stableCallback])

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
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
  
  // Stabilize callbacks to prevent re-subscriptions
  const stableSubscriptions = subscriptions.map(sub => ({
    ...sub,
    callback: useCallback(sub.callback, [])
  }))

  useEffect(() => {
    if (!user || !enabled || stableSubscriptions.length === 0 || DISABLE_REALTIME) {
      return
    }

    // Clean up existing subscriptions
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }

    const configs = stableSubscriptions.map((sub, index) => ({
      name: `${sub.table}_${sub.event}_${user.id}_multi_${index}`,
      config: {
        table: sub.table,
        event: sub.event,
        filter: sub.filter || `member_id=eq.${user.id}`,
        callback: sub.callback
      }
    }))

    const cleanup = createMultipleSubscriptions(configs)
    cleanupRef.current = cleanup

    return () => {
      cleanup()
      cleanupRef.current = null
    }
  }, [user, enabled, stableSubscriptions])

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
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
    if (DISABLE_REALTIME) {
      setStatus('DISCONNECTED')
      return
    }

    const connection = RealtimeConnection.getInstance()
    connectionRef.current = connection

    const unsubscribe = connection.onStatusChange((newStatus) => {
      setStatus(newStatus)
    })

    return unsubscribe
  }, [])

  return {
    status: DISABLE_REALTIME ? 'DISCONNECTED' : status,
    isConnected: DISABLE_REALTIME ? false : status === 'CONNECTED',
    isReconnecting: DISABLE_REALTIME ? false : status === 'RECONNECTING',
    isDisconnected: DISABLE_REALTIME ? true : status === 'DISCONNECTED'
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

  // If realtime is disabled, return null values
  if (DISABLE_REALTIME) {
    return {
      contactCount: null,
      emailCount: null,
      activityCount: null,
      setContactCount: () => {},
      setEmailCount: () => {},
      setActivityCount: () => {}
    }
  }

  // Stabilize callbacks to prevent re-subscriptions
  const handleContactUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    if (payload.eventType === 'INSERT') {
      setContactCount(prev => prev !== null ? prev + 1 : null)
    } else if (payload.eventType === 'DELETE') {
      setContactCount(prev => prev !== null ? Math.max(0, prev - 1) : null)
    }
  }, [])

  const handleEmailUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    setEmailCount(prev => prev !== null ? prev + 1 : null)
  }, [])

  const handleActivityUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    setActivityCount(prev => prev !== null ? prev + 1 : null)
  }, [])

  // Contact updates with unique channel suffix
  useRealtimeSubscription(
    'contacts',
    '*',
    handleContactUpdate,
    { channelSuffix: 'dashboard' }
  )

  // Email updates
  useRealtimeSubscription(
    'sent_emails',
    'INSERT',
    handleEmailUpdate,
    { channelSuffix: 'dashboard' }
  )

  // Activity updates
  useRealtimeSubscription(
    'member_activities',
    'INSERT',
    handleActivityUpdate,
    { channelSuffix: 'dashboard' }
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

  const handleActivityInsert = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
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
  }, [onNewActivity])

  useRealtimeSubscription(
    'member_activities',
    'INSERT',
    handleActivityInsert,
    { channelSuffix: 'activity_feed' }
  )

  const markActivityAsSeen = useCallback(() => {
    setNewActivityCount(0)
  }, [])

  return {
    activities,
    newActivityCount,
    markActivityAsSeen,
    setActivities
  }
}

// Helper function for activity descriptions
function getActivityDescription(activity: any): string {
  switch (activity.activity_type) {
    case 'contact_added':
      return `Added new contact: ${activity.metadata?.contact_name || 'Unknown'}`
    case 'email_sent':
      return `Sent email to ${activity.metadata?.contact_name || activity.metadata?.email || 'contact'}`
    case 'email_opened':
      return `Email opened by ${activity.metadata?.contact_name || 'contact'}`
    case 'email_clicked':
      return `Email link clicked by ${activity.metadata?.contact_name || 'contact'}`
    case 'login':
      return 'Logged into dashboard'
    case 'training_completed':
      return `Completed training: ${activity.metadata?.course_name || 'Unknown course'}`
    case 'goal_achieved':
      return `Achieved goal: ${activity.metadata?.goal_name || 'Unknown goal'}`
    default:
      return activity.metadata?.description || 'Activity recorded'
  }
} 