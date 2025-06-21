'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'

// Define types based on our SIMPLIFIED database structure
interface Course {
  id: string
  title: string
  description?: string
  cover_image?: string
  order_index: number
  is_published: boolean
  modules: Array<{
    name: string
    order: number
    videos: Array<{
      id: string
      title: string
      description?: string
      video_url: string
      video_platform?: string
      duration_seconds?: number
      thumbnail_url?: string
      order_index: number
      lesson_order: number
      is_required: boolean
      progress?: {
        progress_seconds: number
        completed: boolean
        last_watched_at?: string
      }
    }>
  }>
}

interface VideoProgress {
  videoId: string
  progressSeconds: number
  completed: boolean
  lastWatchedAt?: string
  videoTitle?: string
  moduleTitle?: string
  courseTitle?: string
}

interface CoursesResponse {
  courses: Course[]
  recommendedNext?: string
  totalCourses: number
  totalLessons: number
  completedLessons: number
  overallProgress: number
}

// Training courses query
export const useTrainingCourses = () => {
  return useQuery({
    queryKey: queryKeys.training,
    queryFn: async () => {
      const response = await fetch('/api/training/courses', {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch training courses')
      }
      
      const data = await response.json()
      return data as CoursesResponse
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Alias for backward compatibility
export const useTrainingVideos = useTrainingCourses

// User's video progress (using our SIMPLIFIED member_progress table)
export const useVideoProgress = () => {
  return useQuery({
    queryKey: queryKeys.videoProgress(),
    queryFn: async () => {
      const response = await fetch('/api/training/progress', {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch video progress')
      }
      
      const data = await response.json()
      return data.videoProgress as VideoProgress[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Specific video progress
export const useVideoProgressById = (videoId: string) => {
  return useQuery({
    queryKey: queryKeys.videoProgressById(videoId),
    queryFn: async () => {
      const response = await fetch(`/api/training/progress?videoId=${videoId}`, {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch video progress')
      }
      
      const data = await response.json()
      return data.videoProgress?.find((p: VideoProgress) => p.videoId === videoId) || null
    },
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
  })
}

// Start watching video mutation
export const useStartWatchingVideo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await fetch('/api/training/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ videoId }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start watching video')
      }
      
      const result = await response.json()
      return result
    },
    onSuccess: (data, videoId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgressById(videoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.training })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Update video progress mutation
export const useUpdateVideoProgress = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      videoId,
      progressSeconds,
      completed,
    }: {
      videoId: string
      progressSeconds: number
      completed?: boolean
    }) => {
      const response = await fetch('/api/training/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          videoId,
          progressSeconds,
          completed,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update video progress')
      }
      
      const result = await response.json()
      return result.progress
    },
    onMutate: async ({ videoId, progressSeconds, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.videoProgress() })
      await queryClient.cancelQueries({ queryKey: queryKeys.videoProgressById(videoId) })
      
      // Get current data
      const previousVideoProgress = queryClient.getQueryData(queryKeys.videoProgressById(videoId))
      const previousAllProgress = queryClient.getQueryData(queryKeys.videoProgress())
      
      // Optimistically update video progress
      if (previousVideoProgress) {
        const updatedProgress = {
          ...previousVideoProgress,
          progressSeconds,
          completed: completed !== undefined ? completed : (previousVideoProgress as any).completed,
          lastWatchedAt: new Date().toISOString(),
        }
        queryClient.setQueryData(queryKeys.videoProgressById(videoId), updatedProgress)
      }

      // Update progress in the all progress array
      if (Array.isArray(previousAllProgress)) {
        const updatedAllProgress = (previousAllProgress as VideoProgress[]).map(progress =>
          progress.videoId === videoId
            ? {
                ...progress,
                progressSeconds,
                completed: completed !== undefined ? completed : progress.completed,
                lastWatchedAt: new Date().toISOString(),
              }
            : progress
        )
        queryClient.setQueryData(queryKeys.videoProgress(), updatedAllProgress)
      }
      
      return { previousVideoProgress, previousAllProgress }
    },
    onError: (err, { videoId }, context) => {
      // Rollback optimistic updates
      if (context?.previousVideoProgress) {
        queryClient.setQueryData(queryKeys.videoProgressById(videoId), context.previousVideoProgress)
      }
      if (context?.previousAllProgress) {
        queryClient.setQueryData(queryKeys.videoProgress(), context.previousAllProgress)
      }
    },
    onSettled: (data, error, { videoId }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgressById(videoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.training })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Complete video mutation
export const useCompleteVideo = () => {
  const updateProgress = useUpdateVideoProgress()
  
  return useMutation({
    mutationFn: async (videoId: string) => {
      return updateProgress.mutateAsync({
        videoId,
        progressSeconds: 0, // Will be updated by actual progress
        completed: true,
      })
    },
  })
}

// Get course categories (for filtering)
export const useVideoCategories = () => {
  return useQuery({
    queryKey: queryKeys.videoCategories(),
    queryFn: async () => {
      const response = await fetch('/api/training/courses?categoriesOnly=true', {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch course categories')
      }
      
      const data = await response.json()
      return data.categories as string[]
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
  })
}
