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

// Global channel tracking to prevent duplicates
const activeChannels = new Map<string, RealtimeChannel>()

/**
 * Creates a realtime subscription for database changes
 */
export function createRealtimeSubscription(
  channelName: string,
  config: SubscriptionConfig
): RealtimeSubscription {
  // Clean up any existing channel with the same name
  const existingChannel = activeChannels.get(channelName)
  if (existingChannel) {
    console.log(`🔄 Cleaning up existing channel: ${channelName}`)
    supabase.removeChannel(existingChannel)
    activeChannels.delete(channelName)
  }

  const channel = supabase.channel(channelName)
  activeChannels.set(channelName, channel)

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
      // Clean up failed channel
      activeChannels.delete(channelName)
    } else if (status === 'TIMED_OUT') {
      console.warn(`⏰ Subscription to ${channelName} timed out`)
    } else if (status === 'CLOSED') {
      console.log(`🔌 Channel ${channelName} closed`)
      activeChannels.delete(channelName)
    }
  })

  return {
    channel,
    unsubscribe: () => {
      try {
        supabase.removeChannel(channel)
        activeChannels.delete(channelName)
        console.log(`🔌 Unsubscribed from ${channelName}`)
      } catch (error) {
        console.warn(`⚠️ Error unsubscribing from ${channelName}:`, error)
        // Force remove from tracking
        activeChannels.delete(channelName)
      }
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
    subs.forEach(sub => {
      try {
        sub.unsubscribe()
      } catch (error) {
        console.warn('Error during cleanup:', error)
      }
    })
  }
}

/**
 * Get list of active channels (for debugging)
 */
export function getActiveChannels(): string[] {
  return Array.from(activeChannels.keys())
}

/**
 * Force cleanup all channels (use with caution)
 */
export function cleanupAllChannels(): void {
  console.log(`🧹 Cleaning up ${activeChannels.size} active channels`)
  activeChannels.forEach((channel, name) => {
    try {
      supabase.removeChannel(channel)
    } catch (error) {
      console.warn(`Error cleaning up channel ${name}:`, error)
    }
  })
  activeChannels.clear()
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
    // Monitor WebSocket connection through Supabase client
    try {
      // Check if we can access the realtime connection
      const realtime = (supabase as any).realtime
      if (realtime) {
        realtime.onOpen(() => {
          this.updateStatus('CONNECTED')
        })
        realtime.onClose(() => {
          this.updateStatus('DISCONNECTED')
        })
        realtime.onError(() => {
          this.updateStatus('RECONNECTING')
        })
      } else {
        // Fallback: assume connected after a short delay
        setTimeout(() => {
          this.updateStatus('CONNECTED')
        }, 1000)
      }
    } catch (error) {
      console.warn('Could not setup realtime connection listeners:', error)
      // Fallback: assume connected
      this.updateStatus('CONNECTED')
    }
  }

  private updateStatus(status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') {
    if (this.currentStatus !== status) {
      this.currentStatus = status
      console.log(`🔗 Realtime connection status: ${status}`)
      this.connectionCallbacks.forEach(callback => {
        try {
          callback(status)
        } catch (error) {
          console.warn('Error in connection status callback:', error)
        }
      })
    }
  }

  onStatusChange(callback: (status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') => void) {
    this.connectionCallbacks.push(callback)
    // Immediately call with current status
    try {
      callback(this.currentStatus)
    } catch (error) {
      console.warn('Error in initial connection status callback:', error)
    }

    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback)
    }
  }

  getStatus() {
    return this.currentStatus
  }

  getActiveChannelCount() {
    return activeChannels.size
  }

  getActiveSubscriptionsCount() {
    return activeChannels.size
  }

  reconnect() {
    try {
      console.log('🔄 Manually triggering realtime reconnection...')
      this.updateStatus('RECONNECTING')
      
      // Try to access the realtime connection and reconnect
      const realtime = (supabase as any).realtime
      if (realtime && typeof realtime.disconnect === 'function' && typeof realtime.connect === 'function') {
        realtime.disconnect()
        setTimeout(() => {
          realtime.connect()
        }, 1000)
      } else {
        // Fallback: just update status after a delay
        setTimeout(() => {
          this.updateStatus('CONNECTED')
        }, 2000)
      }
    } catch (error) {
      console.warn('Error during manual reconnect:', error)
      this.updateStatus('CONNECTED')
    }
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