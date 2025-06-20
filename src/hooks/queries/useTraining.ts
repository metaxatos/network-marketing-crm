'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'

// Define types based on our EXISTING database structure
interface Course {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  order_index: number
  is_published: boolean
  modules: Array<{
    id: string
    title: string
    order_index: number
    lessons: Array<{
      id: string
      title: string
      description?: string
      video_url?: string
      video_platform?: string
      duration_seconds?: number
      order_index: number
      progress?: {
        progress_seconds: number
        completed: boolean
        last_watched_at?: string
      }
    }>
  }>
}

interface LessonProgress {
  lessonId: string
  progressSeconds: number
  completed: boolean
  lastWatchedAt?: string
  lessonTitle?: string
  moduleTitle?: string
  courseTitle?: string
}

// Training courses query (using our EXISTING database structure)
export const useTrainingVideos = (category?: string) => {
  return useQuery({
    queryKey: queryKeys.trainingVideos(category),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      
      const response = await fetch(`/api/training/courses?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch training courses')
      }
      
      const data = await response.json()
      return data.courses as Course[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Single course detail query 
export const useTrainingVideo = (id: string) => {
  return useQuery({
    queryKey: queryKeys.trainingVideo(id),
    queryFn: async () => {
      const response = await fetch(`/api/training/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch training course')
      }
      
      const data = await response.json()
      return data.course as Course
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

// User's lesson progress (using our EXISTING lesson_progress table)
export const useVideoProgress = () => {
  return useQuery({
    queryKey: queryKeys.videoProgress(),
    queryFn: async () => {
      const response = await fetch('/api/training/progress')
      if (!response.ok) {
        throw new Error('Failed to fetch lesson progress')
      }
      
      const data = await response.json()
      return data.lessonProgress as LessonProgress[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Specific lesson progress
export const useVideoProgressById = (lessonId: string) => {
  return useQuery({
    queryKey: queryKeys.videoProgressById(lessonId),
    queryFn: async () => {
      const response = await fetch(`/api/training/progress?lessonId=${lessonId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch lesson progress')
      }
      
      const data = await response.json()
      return data.lessonProgress?.find((p: LessonProgress) => p.lessonId === lessonId) || null
    },
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,
  })
}

// Start watching lesson mutation (using existing lesson structure)
export const useStartWatchingVideo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await fetch('/api/training/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start watching lesson')
      }
      
      const result = await response.json()
      return result
    },
    onSuccess: (data, lessonId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgressById(lessonId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingVideos() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Update lesson progress mutation (using our EXISTING lesson_progress table)
export const useUpdateVideoProgress = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      lessonId,
      progressSeconds,
      completed,
    }: {
      lessonId: string
      progressSeconds: number
      completed?: boolean
    }) => {
      const response = await fetch('/api/training/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          progressSeconds,
          completed,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update lesson progress')
      }
      
      const result = await response.json()
      return result.progress
    },
    onMutate: async ({ lessonId, progressSeconds, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.videoProgress() })
      await queryClient.cancelQueries({ queryKey: queryKeys.videoProgressById(lessonId) })
      
      // Get current data
      const previousLessonProgress = queryClient.getQueryData(queryKeys.videoProgressById(lessonId))
      const previousAllProgress = queryClient.getQueryData(queryKeys.videoProgress())
      
      // Optimistically update lesson progress
      if (previousLessonProgress) {
        const updatedProgress = {
          ...previousLessonProgress,
          progressSeconds: progressSeconds,
          completed: completed !== undefined ? completed : (previousLessonProgress as any).completed,
          lastWatchedAt: new Date().toISOString(),
        }
        queryClient.setQueryData(queryKeys.videoProgressById(lessonId), updatedProgress)
      }

      // Update progress in the all progress array
      if (Array.isArray(previousAllProgress)) {
        const updatedAllProgress = (previousAllProgress as LessonProgress[]).map(progress =>
          progress.lessonId === lessonId
            ? {
                ...progress,
                progressSeconds: progressSeconds,
                completed: completed !== undefined ? completed : progress.completed,
                lastWatchedAt: new Date().toISOString(),
              }
            : progress
        )
        queryClient.setQueryData(queryKeys.videoProgress(), updatedAllProgress)
      }
      
      return { previousLessonProgress, previousAllProgress }
    },
    onError: (err, { lessonId }, context) => {
      // Rollback optimistic updates
      if (context?.previousLessonProgress) {
        queryClient.setQueryData(queryKeys.videoProgressById(lessonId), context.previousLessonProgress)
      }
      if (context?.previousAllProgress) {
        queryClient.setQueryData(queryKeys.videoProgress(), context.previousAllProgress)
      }
    },
    onSettled: (data, error, { lessonId }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgressById(lessonId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Complete lesson mutation (using our EXISTING lesson_progress table)
export const useCompleteVideo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await fetch('/api/training/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          completed: true,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete lesson')
      }
      
      const result = await response.json()
      return result.progress
    },
    onSuccess: (data, lessonId) => {
      // Invalidate all training related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.videoProgressById(lessonId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.trainingVideos() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Get course categories (for filtering)
export const useVideoCategories = () => {
  return useQuery({
    queryKey: queryKeys.videoCategories(),
    queryFn: async () => {
      const response = await fetch('/api/training/courses?categoriesOnly=true')
      if (!response.ok) {
        throw new Error('Failed to fetch course categories')
      }
      
      const data = await response.json()
      return data.categories as string[]
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
  })
}
