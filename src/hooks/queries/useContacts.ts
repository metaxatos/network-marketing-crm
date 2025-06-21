'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys, getInvalidationQueries } from '@/lib/queryKeys'
import type { Contact, ContactStatus } from '@/types'

// Simplified note type for inline storage
interface ContactNote {
  id: string
  content: string
  created_at: string
  created_by: string
}

// Contact list query
export const useContacts = (filters?: {
  searchQuery?: string
  statusFilter?: ContactStatus | 'all'
}) => {
  return useQuery({
    queryKey: queryKeys.contactList(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.searchQuery) params.append('search', filters.searchQuery)
      if (filters?.statusFilter && filters.statusFilter !== 'all') {
        params.append('status', filters.statusFilter)
      }
      
      const url = `/api/contacts?${params.toString()}`
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[useContacts] Fetch failed:', response.status, errorText)
        
        // Check if it's an authentication error
        if (response.status === 401) {
          throw new Error('Authentication not configured. Please set up your environment variables.')
        }
        
        // Check if it's a configuration error
        if (errorText.includes('Supabase not configured') || errorText.includes('Missing Supabase environment variables')) {
          throw new Error('Supabase is not configured. Please add your environment variables to .env.local file.')
        }
        
        throw new Error('Failed to fetch contacts')
      }
      
      const result = await response.json()
      // Fix: API returns { data: { contacts: ... }, success: true }
      return result.data?.contacts as Contact[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry authentication or configuration errors
      if (error.message.includes('Authentication not configured') || 
          error.message.includes('Supabase is not configured')) {
        return false
      }
      // Retry other errors up to 3 times
      return failureCount < 3
    },
  })
}

// Contact detail query (alias for backward compatibility)
export const useContact = (id: string) => {
  return useQuery({
    queryKey: queryKeys.contact(id),
    queryFn: async () => {
      const response = await fetch(`/api/contacts/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch contact')
      }
      
      const data = await response.json()
      return data.contact as Contact
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Detailed contact query (new key structure)
export const useContactDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.contactDetail(id),
    queryFn: async () => {
      const response = await fetch(`/api/contacts/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch contact')
      }
      
      const data = await response.json()
      return data.contact as Contact
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Contact notes query (now reads from inline notes)
export const useContactNotes = (contactId: string) => {
  return useQuery({
    queryKey: queryKeys.contactNotes(contactId),
    queryFn: async () => {
      const response = await fetch(`/api/contacts/${contactId}/notes`)
      if (!response.ok) {
        throw new Error('Failed to fetch contact notes')
      }
      
      const data = await response.json()
      return data.notes as ContactNote[]
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes for notes
  })
}

// Contact interactions/communications query (NEW - uses communications table)
export const useContactCommunications = (contactId: string) => {
  return useQuery({
    queryKey: queryKeys.communicationsByContact(contactId),
    queryFn: async () => {
      const response = await fetch(`/api/communications?contactId=${contactId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch contact communications')
      }
      
      const data = await response.json()
      return data.communications || []
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000,
  })
}

// Create contact mutation
export const useCreateContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (contactData: Omit<Contact, 'id' | 'member_id' | 'company_id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create contact')
      }
      
      const result = await response.json()
      // Fix: API returns { data: { contact: ... }, success: true }
      return result.data?.contact as Contact
    },
    onMutate: async (newContact) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts })
      
      // Optimistically update all contact lists
      const queryCache = queryClient.getQueryCache()
      const contactListQueries = queryCache.findAll({ 
        queryKey: queryKeys.contacts,
        type: 'active'
      })
      
      const previousData: Array<{ queryKey: any; data: any }> = []
      
      contactListQueries.forEach((query) => {
        if (query.queryKey.includes('list')) {
          const oldData = queryClient.getQueryData(query.queryKey)
          if (Array.isArray(oldData)) {
            previousData.push({ queryKey: query.queryKey, data: oldData })
            
            const optimisticContact = {
              ...newContact,
              id: `temp-${Date.now()}`,
              member_id: 'current-user', // Will be set by server
              company_id: 'current-company', // Will be set by server
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Contact
            
            queryClient.setQueryData(query.queryKey, [optimisticContact, ...oldData])
          }
        }
      })
      
      return { previousData }
    },
    onError: (err, newContact, context) => {
      // Rollback optimistic updates
      if (context?.previousData) {
        context.previousData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Update contact mutation
export const useUpdateContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contact> }) => {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update contact')
      }
      
      const result = await response.json()
      // Fix: API returns { data: { contact: ... }, success: true }
      return result.data?.contact as Contact
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.contactDetail(id) })
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts })
      
      // Get current data
      const previousContact = queryClient.getQueryData(queryKeys.contactDetail(id))
      const previousLists: Array<{ queryKey: any; data: any }> = []
      
      // Optimistically update contact detail
      if (previousContact) {
        queryClient.setQueryData(queryKeys.contactDetail(id), {
          ...previousContact,
          ...updates,
          updated_at: new Date().toISOString(),
        })
      }
      
      // Update in all contact lists
      const queryCache = queryClient.getQueryCache()
      const contactListQueries = queryCache.findAll({ 
        queryKey: queryKeys.contacts,
        type: 'active'
      })
      
      contactListQueries.forEach((query) => {
        if (query.queryKey.includes('list')) {
          const oldData = queryClient.getQueryData(query.queryKey)
          if (Array.isArray(oldData)) {
            previousLists.push({ queryKey: query.queryKey, data: oldData })
            
            const updatedList = oldData.map((contact: Contact) =>
              contact.id === id
                ? { ...contact, ...updates, updated_at: new Date().toISOString() }
                : contact
            )
            queryClient.setQueryData(query.queryKey, updatedList)
          }
        }
      })
      
      return { previousContact, previousLists }
    },
    onError: (err, { id }, context) => {
      // Rollback optimistic updates
      if (context?.previousContact) {
        queryClient.setQueryData(queryKeys.contactDetail(id), context.previousContact)
      }
      if (context?.previousLists) {
        context.previousLists.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.contactDetail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
    },
  })
}

// Delete contact mutation
export const useDeleteContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete contact')
      }
      
      return id
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts })
      
      // Optimistically remove from all lists
      const queryCache = queryClient.getQueryCache()
      const contactListQueries = queryCache.findAll({ 
        queryKey: queryKeys.contacts,
        type: 'active'
      })
      
      const previousLists: Array<{ queryKey: any; data: any }> = []
      
      contactListQueries.forEach((query) => {
        if (query.queryKey.includes('list')) {
          const oldData = queryClient.getQueryData(query.queryKey)
          if (Array.isArray(oldData)) {
            previousLists.push({ queryKey: query.queryKey, data: oldData })
            
            const filteredList = oldData.filter((contact: Contact) => contact.id !== id)
            queryClient.setQueryData(query.queryKey, filteredList)
          }
        }
      })
      
      return { previousLists }
    },
    onError: (err, id, context) => {
      // Rollback optimistic updates
      if (context?.previousLists) {
        context.previousLists.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Add contact note mutation (NEW - for inline notes)
export const useAddContactNote = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contactId, content }: { contactId: string; content: string }) => {
      const response = await fetch(`/api/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add note')
      }
      
      const result = await response.json()
      return result.note
    },
    onMutate: async ({ contactId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.contactNotes(contactId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.contactDetail(contactId) })
      
      // Get current data
      const previousNotes = queryClient.getQueryData(queryKeys.contactNotes(contactId))
      const previousContact = queryClient.getQueryData(queryKeys.contactDetail(contactId))
      
      // Create optimistic note
      const optimisticNote = {
        id: `temp-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        created_by: 'current-user',
      }
      
      // Optimistically update notes list
      if (Array.isArray(previousNotes)) {
        queryClient.setQueryData(queryKeys.contactNotes(contactId), [optimisticNote, ...previousNotes])
      } else {
        queryClient.setQueryData(queryKeys.contactNotes(contactId), [optimisticNote])
      }
      
      // Update contact with new last_contacted_at
      if (previousContact) {
        queryClient.setQueryData(queryKeys.contactDetail(contactId), {
          ...previousContact,
          last_contacted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
      
      return { previousNotes, previousContact, optimisticNote }
    },
    onError: (err, { contactId }, context) => {
      // Rollback optimistic updates
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.contactNotes(contactId), context.previousNotes)
      }
      if (context?.previousContact) {
        queryClient.setQueryData(queryKeys.contactDetail(contactId), context.previousContact)
      }
    },
    onSettled: (data, error, { contactId }) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.contactNotes(contactId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.contactDetail(contactId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
      queryClient.invalidateQueries({ queryKey: queryKeys.communications })
    },
  })
} 