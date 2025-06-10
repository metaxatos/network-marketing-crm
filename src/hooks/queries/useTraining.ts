'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import type { Course, Lesson, UserProgress, CourseProgress } from '@/types'

// Courses query
export const useCourses = () => {
  return useQuery({
    queryKey: queryKeys.courses(),
    queryFn: async () => {
      const response = await fetch('/api/training/courses')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      
      const data = await response.json()
      return data.courses as Course[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Course detail query
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: queryKeys.courseDetail(id),
    queryFn: async () => {
      const response = await fetch(`/api/training/courses/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch course')
      }
      
      const data = await response.json()
      return data.course as Course
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

// Lesson detail query
export const useLesson = (courseId: string, lessonId: string) => {
  return useQuery({
    queryKey: queryKeys.lessonDetail(courseId, lessonId),
    queryFn: async () => {
      const response = await fetch(`/api/training/courses/${courseId}/lessons/${lessonId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch lesson')
      }
      
      const data = await response.json()
      return data.lesson as Lesson
    },
    enabled: !!courseId && !!lessonId,
    staleTime: 15 * 60 * 1000, // 15 minutes (lessons don't change often)
  })
}

// User's overall training progress
export const useUserProgress = () => {
  return useQuery({
    queryKey: queryKeys.userProgress(),
    queryFn: async () => {
      const response = await fetch('/api/training/progress')
      if (!response.ok) {
        throw new Error('Failed to fetch user progress')
      }
      
      const data = await response.json()
      return data.progress as UserProgress
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Course-specific progress
export const useCourseProgress = (courseId: string) => {
  return useQuery({
    queryKey: queryKeys.courseProgress(courseId),
    queryFn: async () => {
      const response = await fetch(`/api/training/courses/${courseId}/progress`)
      if (!response.ok) {
        throw new Error('Failed to fetch course progress')
      }
      
      const data = await response.json()
      return data.progress as CourseProgress
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  })
}

// Enroll in course mutation
export const useEnrollInCourse = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/training/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to enroll in course')
      }
      
      const result = await response.json()
      return result
    },
    onSuccess: (data, courseId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.courseProgress(courseId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.userProgress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.courses() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Update lesson progress mutation
export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      courseId,
      lessonId,
      completed,
      watchTime,
      notes,
    }: {
      courseId: string
      lessonId: string
      completed?: boolean
      watchTime?: number
      notes?: string
    }) => {
      const response = await fetch(`/api/training/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed,
          watchTime,
          notes,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update lesson progress')
      }
      
      const result = await response.json()
      return result.progress
    },
    onMutate: async ({ courseId, lessonId, completed, watchTime }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.courseProgress(courseId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.userProgress() })
      
      // Get current data
      const previousCourseProgress = queryClient.getQueryData(queryKeys.courseProgress(courseId))
      const previousUserProgress = queryClient.getQueryData(queryKeys.userProgress())
      
      // Optimistically update course progress
      if (previousCourseProgress) {
        const updatedProgress = {
          ...previousCourseProgress,
          lessons: (previousCourseProgress as any).lessons?.map((lesson: any) =>
            lesson.lesson_id === lessonId
              ? { 
                  ...lesson, 
                  completed: completed !== undefined ? completed : lesson.completed,
                  watch_time: watchTime !== undefined ? watchTime : lesson.watch_time,
                  updated_at: new Date().toISOString(),
                }
              : lesson
          ),
        }
        queryClient.setQueryData(queryKeys.courseProgress(courseId), updatedProgress)
      }
      
      return { previousCourseProgress, previousUserProgress }
    },
    onError: (err, { courseId }, context) => {
      // Rollback optimistic updates
      if (context?.previousCourseProgress) {
        queryClient.setQueryData(queryKeys.courseProgress(courseId), context.previousCourseProgress)
      }
      if (context?.previousUserProgress) {
        queryClient.setQueryData(queryKeys.userProgress(), context.previousUserProgress)
      }
    },
    onSettled: (data, error, { courseId }) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.courseProgress(courseId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.userProgress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Complete course mutation
export const useCompleteCourse = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/training/courses/${courseId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete course')
      }
      
      const result = await response.json()
      return result
    },
    onSuccess: (data, courseId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.courseProgress(courseId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.userProgress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.courses() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Add lesson note mutation
export const useAddLessonNote = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      courseId,
      lessonId,
      content,
    }: {
      courseId: string
      lessonId: string
      content: string
    }) => {
      const response = await fetch(`/api/training/courses/${courseId}/lessons/${lessonId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add lesson note')
      }
      
      const result = await response.json()
      return result.note
    },
    onSuccess: (data, { courseId, lessonId }) => {
      // Invalidate lesson and progress queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lessonDetail(courseId, lessonId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.courseProgress(courseId) })
    },
  })
} 