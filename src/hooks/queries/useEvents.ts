'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { Event, EventStats, CreateEventData, EventFilters } from '@/types/events'
import { useAuth } from '@/hooks/useAuth'

// Fetch events from API
export const useEvents = (filters?: EventFilters) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.events(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.event_types?.length) {
        params.append('event_types', filters.event_types.join(','))
      }
      if (filters?.formats?.length) {
        params.append('formats', filters.formats.join(','))
      }
      if (filters?.search) {
        params.append('search', filters.search)
      }
      if (filters?.date_range?.start) {
        params.append('date_start', filters.date_range.start)
      }
      if (filters?.date_range?.end) {
        params.append('date_end', filters.date_range.end)
      }
      
      const response = await fetch(`/api/events?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view events')
        }
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch events' }))
        throw new Error(errorData.error || 'Failed to fetch events')
      }
      
      const data = await response.json()
      return data.events as Event[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !authLoading && isAuthenticated, // Only run when auth is ready and user is authenticated
  })
}

// Fetch event statistics
export const useEventStats = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.eventStats(),
    queryFn: async () => {
      const response = await fetch('/api/events/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view event statistics')
        }
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch event stats' }))
        throw new Error(errorData.error || 'Failed to fetch event stats')
      }
      
      const data = await response.json()
      return data as EventStats
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !authLoading && isAuthenticated, // Only run when auth is ready and user is authenticated
  })
}

// Create new event
export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create event')
      }
      
      const result = await response.json()
      return result as Event
    },
    onSuccess: () => {
      // Invalidate and refetch events
      queryClient.invalidateQueries({ queryKey: queryKeys.events() })
      queryClient.invalidateQueries({ queryKey: queryKeys.eventStats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Register for event
export const useRegisterForEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to register for event')
      }
      
      const result = await response.json()
      return result
    },
    onSuccess: () => {
      // Invalidate events to refresh registration status
      queryClient.invalidateQueries({ queryKey: queryKeys.events() })
      queryClient.invalidateQueries({ queryKey: queryKeys.eventStats() })
    },
  })
}

// Cancel event registration
export const useCancelEventRegistration = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel registration')
      }
      
      const result = await response.json()
      return result
    },
    onSuccess: () => {
      // Invalidate events to refresh registration status
      queryClient.invalidateQueries({ queryKey: queryKeys.events() })
      queryClient.invalidateQueries({ queryKey: queryKeys.eventStats() })
    },
  })
}

// Get single event
export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.event(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }
      
      const data = await response.json()
      return data as Event
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  })
} 