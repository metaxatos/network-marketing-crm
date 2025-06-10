import { useEffect } from 'react'
import { useContactStore } from '@/stores/contactStore'
import { useRealtimeSubscription } from './useRealtime'
import type { Contact } from '@/types'

/**
 * Hook that sets up realtime subscriptions for contacts
 * Integrates with the contact store to automatically update UI
 */
export function useContactsRealtime() {
  const { 
    handleRealtimeInsert, 
    handleRealtimeUpdate, 
    handleRealtimeDelete 
  } = useContactStore()

  // Subscribe to contact insertions
  useRealtimeSubscription(
    'contacts',
    'INSERT',
    (payload) => {
      const newContact = payload.new as Contact
      handleRealtimeInsert(newContact)
    }
  )

  // Subscribe to contact updates
  useRealtimeSubscription(
    'contacts',
    'UPDATE',
    (payload) => {
      const updatedContact = payload.new as Contact
      handleRealtimeUpdate(updatedContact)
    }
  )

  // Subscribe to contact deletions
  useRealtimeSubscription(
    'contacts',
    'DELETE',
    (payload) => {
      const deletedContactId = (payload.old as any)?.id as string
      if (deletedContactId) {
        handleRealtimeDelete(deletedContactId)
      }
    }
  )
} 