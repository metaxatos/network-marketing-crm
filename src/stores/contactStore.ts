import { create } from 'zustand'
import type { Contact, ContactStatus, ContactNote } from '@/types'
import { useRealtimeSubscription } from '@/hooks/useRealtime'

interface ContactStore {
  // UI State only - server state is handled by React Query
  searchQuery: string
  statusFilter: ContactStatus | 'all'
  selectedContact: Contact | null
  
  // UI Actions
  searchContacts: (query: string) => void
  filterByStatus: (status: ContactStatus | 'all') => void
  selectContact: (contact: Contact | null) => void
  
  // Realtime actions (for optimistic updates)
  handleRealtimeInsert: (contact: Contact) => void
  handleRealtimeUpdate: (contact: Contact) => void
  handleRealtimeDelete: (contactId: string) => void
}

export const useContactStore = create<ContactStore>((set, get) => ({
  // Initial UI state
  searchQuery: '',
  statusFilter: 'all',
  selectedContact: null,

  // Search contacts - only update UI state
  searchContacts: (query: string) => {
    set({ searchQuery: query })
  },

  // Filter by status - only update UI state
  filterByStatus: (status: ContactStatus | 'all') => {
    set({ statusFilter: status })
  },

  // Select contact - only update UI state
  selectContact: (contact: Contact | null) => {
    set({ selectedContact: contact })
  },

  // Realtime handlers - these will trigger React Query invalidation
  handleRealtimeInsert: (contact: Contact) => {
    // React Query will handle the actual data updates
    // This is just for any immediate UI updates if needed
    console.log('Realtime contact added:', contact.id)
  },

  handleRealtimeUpdate: (contact: Contact) => {
    // Update selected contact if it matches
    set(state => ({
      selectedContact: state.selectedContact?.id === contact.id ? contact : state.selectedContact
    }))
    console.log('Realtime contact updated:', contact.id)
  },

  handleRealtimeDelete: (contactId: string) => {
    // Clear selected contact if it was deleted
    set(state => ({
      selectedContact: state.selectedContact?.id === contactId ? null : state.selectedContact
    }))
    console.log('Realtime contact deleted:', contactId)
  },
}))

// Legacy compatibility - these functions are now handled by React Query hooks
// But keeping them for components that haven't been migrated yet
export const useContactStoreCompat = () => {
  const store = useContactStore()
  
  return {
    ...store,
    
    // Mock functions that redirect to React Query
    loadContacts: async () => {
      console.warn('loadContacts is deprecated - use useContacts hook instead')
    },
    
    addContact: async (contactData: any) => {
      console.warn('addContact is deprecated - use useCreateContact hook instead')
      return { success: false, error: 'Use useCreateContact hook' }
    },
    
    updateContact: async (id: string, updates: any) => {
      console.warn('updateContact is deprecated - use useUpdateContact hook instead')
      return { success: false, error: 'Use useUpdateContact hook' }
    },
    
    deleteContact: async (id: string) => {
      console.warn('deleteContact is deprecated - use useDeleteContact hook instead')
      return { success: false, error: 'Use useDeleteContact hook' }
    },
    
    addNote: async (contactId: string, content: string) => {
      console.warn('addNote is deprecated - use useAddContactNote hook instead')
      return { success: false, error: 'Use useAddContactNote hook' }
    },
    
    loadNotes: async (contactId: string) => {
      console.warn('loadNotes is deprecated - use useContactNotes hook instead')
      return []
    },
    
    getContactById: (id: string) => {
      console.warn('getContactById is deprecated - use useContact hook instead')
      return undefined
    },
    
    getFilteredContacts: () => {
      console.warn('getFilteredContacts is deprecated - use useContacts with filters instead')
      return []
    },
    
    // Mock state for compatibility
    contacts: [],
    isLoading: false,
  }
} 