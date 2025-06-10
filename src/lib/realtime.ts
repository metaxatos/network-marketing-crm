import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type DatabaseEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface RealtimeSubscription {
  channel: RealtimeChannel
  unsubscribe: () => void
}

export interface SubscriptionConfig {
  table: string
  event: DatabaseEvent
  schema?: string
  filter?: string
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
}

/**
 * Creates a realtime subscription for database changes
 */
export function createRealtimeSubscription(
  channelName: string,
  config: SubscriptionConfig
): RealtimeSubscription {
  const channel = supabase.channel(channelName)

  // Subscribe to postgres changes
  channel.on('postgres_changes', {
    event: config.event,
    schema: config.schema || 'public',
    table: config.table,
    ...(config.filter && { filter: config.filter })
  } as any, config.callback)

  // Subscribe to the channel
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`✅ Subscribed to ${channelName}`)
    } else if (status === 'CHANNEL_ERROR') {
      console.error(`❌ Failed to subscribe to ${channelName}`)
    } else if (status === 'TIMED_OUT') {
      console.warn(`⏰ Subscription to ${channelName} timed out`)
    }
  })

  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel)
      console.log(`🔌 Unsubscribed from ${channelName}`)
    }
  }
}

/**
 * Creates multiple realtime subscriptions and returns cleanup function
 */
export function createMultipleSubscriptions(
  subscriptions: Array<{ name: string; config: SubscriptionConfig }>
): () => void {
  const subs = subscriptions.map(sub => 
    createRealtimeSubscription(sub.name, sub.config)
  )

  return () => {
    subs.forEach(sub => sub.unsubscribe())
  }
}

/**
 * Connection status utilities
 */
export class RealtimeConnection {
  private static instance: RealtimeConnection
  private connectionCallbacks: Array<(status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') => void> = []
  private currentStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' = 'DISCONNECTED'

  private constructor() {
    this.setupConnectionListeners()
  }

  static getInstance(): RealtimeConnection {
    if (!RealtimeConnection.instance) {
      RealtimeConnection.instance = new RealtimeConnection()
    }
    return RealtimeConnection.instance
  }

  private setupConnectionListeners() {
    // Note: Supabase handles connection status internally
    // We'll track status through channel subscription callbacks
    // For now, assume connected state
    this.updateStatus('CONNECTED')
  }

  private updateStatus(status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') {
    if (this.currentStatus !== status) {
      this.currentStatus = status
      this.connectionCallbacks.forEach(callback => callback(status))
    }
  }

  onStatusChange(callback: (status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') => void) {
    this.connectionCallbacks.push(callback)
    // Immediately call with current status
    callback(this.currentStatus)

    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback)
    }
  }

  getStatus() {
    return this.currentStatus
  }
}

/**
 * Debounce utility for handling rapid updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Batch updates utility to prevent UI flickering
 */
export class UpdateBatcher<T> {
  private updates: T[] = []
  private timeout: NodeJS.Timeout | null = null
  private delay: number

  constructor(
    private onBatch: (updates: T[]) => void,
    delay: number = 300
  ) {
    this.delay = delay
  }

  add(update: T) {
    this.updates.push(update)
    
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      if (this.updates.length > 0) {
        this.onBatch([...this.updates])
        this.updates = []
      }
      this.timeout = null
    }, this.delay)
  }

  flush() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    
    if (this.updates.length > 0) {
      this.onBatch([...this.updates])
      this.updates = []
    }
  }
} 