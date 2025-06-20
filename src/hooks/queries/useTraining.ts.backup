'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import type { TrainingVideo, MemberProgress } from '@/types/training'

// Training videos query (simplified from courses)
export const useTrainingVideos = (category?: string) => {
  return useQuery({
    queryKey: queryKeys.trainingVideos(category),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      
      const response = await fetch(`/api/training/courses?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch training videos')
      }
      
      const data = await response.json()
      return data.videos as TrainingVideo[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Video detail query (renamed from course detail)
export const useTrainingVideo = (id: string) => {
  return useQuery({
    queryKey: queryKeys.trainingVideo(id),
    queryFn: async () => {
      const response = await fetch(`/api/training/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch training video')
      }
      
      const data = await response.json()
      return data.video as TrainingVideo
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

// User's video progress (simplified from course progress)
export const useVideoProgress = () => {
  return useQuery({
    queryKey: queryKeys.videoProgress(),
    queryFn: async () => {
      const response = await fetch('/api/training/progress')
      if (!response.ok) {
        throw new Error('Failed to fetch video progress')
      }
      
      const data = await response.json()
      return data.progress as MemberProgress[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Specific video progress
export const useVideoProgressById = (videoId: string) => {
  return useQuery({
    queryKey: queryKeys.videoProgressById(videoId),
    queryFn: async () => {
      const response = await fetch(`/api/training/progress?videoId=${videoId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch video progress')
      }
      
      const data = await response.json()
      return data.progress?.find((p: MemberProgress) => p.video_id === videoId) || null
    },
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
  })
}

// Start watching video mutation (simplified from course enrollment)
export const useStartWatchingVideo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await fetch('/api/training/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingVideos() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Update video progress mutation (simplified from lesson progress)
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
          progress_seconds: progressSeconds,
          completed: completed !== undefined ? completed : (previousVideoProgress as any).completed,
          last_watched_at: new Date().toISOString(),
        }
        queryClient.setQueryData(queryKeys.videoProgressById(videoId), updatedProgress)
      }

      // Update progress in the all progress array
      if (Array.isArray(previousAllProgress)) {
        const updatedAllProgress = (previousAllProgress as MemberProgress[]).map(progress =>
          progress.video_id === videoId
            ? {
                ...progress,
                progress_seconds: progressSeconds,
                completed: completed !== undefined ? completed : progress.completed,
                last_watched_at: new Date().toISOString(),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Complete video mutation (simplified from complete course)
export const useCompleteVideo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await fetch('/api/training/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          completed: true,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete video')
      }
      
      const result = await response.json()
      return result.progress
    },
    onSuccess: (data, videoId) => {
      // Invalidate all training related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgressById(videoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingVideos() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Get video categories (for filtering)
export const useVideoCategories = () => {
  return useQuery({
    queryKey: queryKeys.videoCategories(),
    queryFn: async () => {
      const response = await fetch('/api/training/courses?categoriesOnly=true')
      if (!response.ok) {
        throw new Error('Failed to fetch video categories')
      }
      
      const data = await response.json()
      return data.categories as string[]
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
  })
}

// LEGACY HOOKS REMOVED to prevent infinite warning loops
// Use the following modern hooks instead:
// - useTrainingVideos() instead of useCourses()  
// - useTrainingVideo(id) instead of useCourse(id)
// - useVideoProgress() instead of useUserProgress() 