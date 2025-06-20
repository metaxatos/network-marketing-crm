import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'

// Define types based on our EXISTING database structure
interface CourseWithProgress {
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

// GET /api/training/courses - Using our EXISTING training structure
export const GET = withAuth(async (req, userId) => {
  try {
    console.log('Training courses API - Starting request for user:', userId)
    const supabase = await createClient()
    
    // Get member's company ID
    let member = null
    try {
      member = await getCurrentMember(userId)
      console.log('Training courses API - Member data:', { 
        memberId: member?.id, 
        companyId: member?.company_id 
      })
    } catch (error) {
      console.warn('Training courses API - Member not found:', error)
    }

    // Query using our EXISTING database structure: training_courses -> course_modules -> course_lessons
    const { data: courses, error } = await supabase
      .from('training_courses')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        order_index,
        is_published,
        course_modules (
          id,
          title,
          order_index,
          course_lessons (
            id,
            title,
            description,
            video_url,
            video_platform,
            duration_seconds,
            order_index,
            lesson_progress (
              progress_seconds,
              completed,
              last_watched_at
            )
          )
        )
      `)
      .eq('is_published', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Training courses API - Database error:', error)
      // Return safe fallback if database query fails
      return apiResponse({
        courses: [],
        recommendedNext: undefined,
        totalCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        overallProgress: 0,
      }, 200)
    }

    console.log('Training courses API - Query successful, found courses:', courses?.length || 0)

    // Transform to expected format (handle null/undefined safely)
    const coursesWithProgress: CourseWithProgress[] = (courses || []).map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      order_index: course.order_index,
      is_published: course.is_published,
      modules: (course.course_modules || []).map((module: any) => ({
        id: module.id,
        title: module.title,
        order_index: module.order_index,
        lessons: (module.course_lessons || []).map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          video_url: lesson.video_url,
          video_platform: lesson.video_platform,
          duration_seconds: lesson.duration_seconds,
          order_index: lesson.order_index,
          progress: lesson.lesson_progress?.[0] ? {
            progress_seconds: lesson.lesson_progress[0].progress_seconds,
            completed: lesson.lesson_progress[0].completed,
            last_watched_at: lesson.lesson_progress[0].last_watched_at,
          } : undefined,
        }))
      }))
    }))

    // Find recommended next lesson (first uncompleted lesson)
    let recommendedNext: string | undefined
    for (const course of coursesWithProgress) {
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (!lesson.progress?.completed) {
            recommendedNext = lesson.id
            break
          }
        }
        if (recommendedNext) break
      }
      if (recommendedNext) break
    }

    // Calculate overall progress
    let totalLessons = 0
    let completedLessons = 0
    coursesWithProgress.forEach(course => {
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          totalLessons++
          if (lesson.progress?.completed) {
            completedLessons++
          }
        })
      })
    })

    return apiResponse({
      courses: coursesWithProgress,
      recommendedNext,
      totalCourses: coursesWithProgress.length,
      totalLessons,
      completedLessons,
      overallProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    }, 200)
  } catch (error) {
    console.error('Get training courses error:', error)
    // Return safe fallback instead of 500 error
    return apiResponse({
      courses: [],
      recommendedNext: undefined,
      totalCourses: 0,
      totalLessons: 0,
      completedLessons: 0,
      overallProgress: 0,
    }, 200)
  }
})
