import { useEffect, useCallback } from 'react'
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

  // Stabilize callbacks to prevent re-subscriptions
  const handleInsert = useCallback((payload: any) => {
    const newContact = payload.new as Contact
    handleRealtimeInsert(newContact)
  }, [handleRealtimeInsert])

  const handleUpdate = useCallback((payload: any) => {
    const updatedContact = payload.new as Contact
    handleRealtimeUpdate(updatedContact)
  }, [handleRealtimeUpdate])

  const handleDelete = useCallback((payload: any) => {
    const deletedContactId = (payload.old as any)?.id as string
    if (deletedContactId) {
      handleRealtimeDelete(deletedContactId)
    }
  }, [handleRealtimeDelete])

  // Subscribe to contact insertions with unique channel suffix
  useRealtimeSubscription(
    'contacts',
    'INSERT',
    handleInsert,
    { channelSuffix: 'contacts_crud' }
  )

  // Subscribe to contact updates with unique channel suffix
  useRealtimeSubscription(
    'contacts',
    'UPDATE',
    handleUpdate,
    { channelSuffix: 'contacts_crud' }
  )

  // Subscribe to contact deletions with unique channel suffix
  useRealtimeSubscription(
    'contacts',
    'DELETE',
    handleDelete,
    { channelSuffix: 'contacts_crud' }
  )
} 