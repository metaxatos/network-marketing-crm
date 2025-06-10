'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import type { DashboardMetrics, Activity, Contact } from '@/types'

// Dashboard metrics query
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: queryKeys.metrics(),
    queryFn: async () => {
      const response = await fetch('/api/dashboard/metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics')
      }
      
      const data = await response.json()
      return data.metrics as DashboardMetrics
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Background refetch every 2 minutes when focused
    refetchIntervalInBackground: false,
  })
}

// Activity feed with infinite scrolling
export const useActivityFeed = (filters?: {
  limit?: number
}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.activities(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams()
      params.append('page', pageParam.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      
      const response = await fetch(`/api/dashboard/activities?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }
      
      const data = await response.json()
      return {
        activities: data.activities as Activity[],
        nextPage: data.hasMore ? pageParam + 1 : undefined,
        hasMore: data.hasMore,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Background refetch every 30 seconds when focused
    refetchIntervalInBackground: false,
    initialPageParam: 0,
  })
}

// Recent contacts query
export const useRecentContacts = () => {
  return useQuery({
    queryKey: queryKeys.recentContacts(),
    queryFn: async () => {
      const response = await fetch('/api/dashboard/recent-contacts')
      if (!response.ok) {
        throw new Error('Failed to fetch recent contacts')
      }
      
      const data = await response.json()
      return data.contacts as Contact[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}

// Quick stats for widgets
export const useQuickStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'quick-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/quick-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch quick stats')
      }
      
      const data = await response.json()
      return data.stats
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Background refetch every 5 minutes
    refetchIntervalInBackground: false,
  })
}

// Upcoming tasks/reminders
export const useUpcomingTasks = () => {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-tasks'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/upcoming-tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming tasks')
      }
      
      const data = await response.json()
      return data.tasks
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  })
}

// Performance metrics over time
export const usePerformanceMetrics = (timeRange: 'week' | 'month' | 'quarter' = 'week') => {
  return useQuery({
    queryKey: ['dashboard', 'performance', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/performance?range=${timeRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics')
      }
      
      const data = await response.json()
      return data.metrics
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (historical data doesn't change often)
  })
}

// Growth chart data
export const useGrowthChartData = (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  return useQuery({
    queryKey: ['dashboard', 'growth-chart', period],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/growth-chart?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch growth chart data')
      }
      
      const data = await response.json()
      return data.chartData
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
} 