import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, withAuth, getCurrentMember } from '@/lib/api-helpers'

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

interface CoursesResponse {
  courses: Course[]
  recommendedNext?: string
  totalCourses: number
  totalLessons: number
  completedLessons: number
  overallProgress: number
}

// GET /api/training/courses - Using our SIMPLIFIED training structure
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    console.log('🎓 Training Courses API - Starting request for user:', userId)
    const supabase = await createClient()
    
    // Get member's company ID for RLS
    let member = null
    try {
      member = await getCurrentMember(userId)
      console.log('🎓 Training Courses API - Member data:', { 
        memberId: member?.id, 
        companyId: member?.company_id 
      })
    } catch (error) {
      console.warn('🎓 Training Courses API - Member not found:', error)
      return apiResponse({ 
        courses: [],
        recommendedNext: undefined,
        totalCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        overallProgress: 0,
      }, 200)
    }

    // Get all published courses with their videos
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        cover_image,
        order_index,
        is_published,
        training_videos (
          id,
          title,
          description,
          video_url,
          video_platform,
          thumbnail_url,
          duration_seconds,
          module_name,
          module_order,
          lesson_order,
          order_index,
          is_required,
          is_published
        )
      `)
      .eq('is_published', true)
      .eq('training_videos.is_published', true)
      .order('order_index', { ascending: true })

    if (coursesError) {
      console.error('🎓 Training Courses API - Database error:', coursesError)
      return apiResponse({ 
        courses: [],
        recommendedNext: undefined,
        totalCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        overallProgress: 0,
      }, 200)
    }

    console.log(`🎓 Training Courses API - Found ${courses?.length || 0} courses`)

    // Get user progress
    const { data: progressData, error: progressError } = await supabase
      .from('member_progress')
      .select('video_id, progress_seconds, completed, last_watched_at')
      .eq('member_id', userId)

    if (progressError) {
      console.warn('🎓 Training Courses API - Progress query error:', progressError)
    }

    // Create progress lookup map
    const progressMap = new Map()
    if (progressData) {
      progressData.forEach((p: any) => {
        progressMap.set(p.video_id, {
          progress_seconds: p.progress_seconds,
          completed: p.completed,
          last_watched_at: p.last_watched_at
        })
      })
    }

    console.log('🎓 Training Courses API - Progress records found:', progressData?.length || 0)

    // Transform the data to organize videos by modules
    const transformedCourses = courses?.map((course: any) => {
      const videos = course.training_videos || []
      
      // Group videos by module
      const moduleMap = new Map()
      
      videos.forEach((video: any) => {
        const moduleKey = video.module_name || 'General'
        if (!moduleMap.has(moduleKey)) {
          moduleMap.set(moduleKey, {
            name: moduleKey,
            order: video.module_order || 0,
            videos: []
          })
        }
        
        // Add progress to video
        const videoProgress = progressMap.get(video.id)
        const videoWithProgress = {
          ...video,
          progress: videoProgress
        }
        
        moduleMap.get(moduleKey).videos.push(videoWithProgress)
      })
      
      // Convert to array and sort
      const modules = Array.from(moduleMap.values())
        .sort((a: any, b: any) => a.order - b.order)
        .map(module => ({
          ...module,
          videos: module.videos.sort((a: any, b: any) => (a.lesson_order || 0) - (b.lesson_order || 0))
        }))

      return {
        ...course,
        modules,
        totalVideos: videos.length
      }
    }) || []

    console.log(`🎓 Training Courses API - Transformed courses with modules:`, transformedCourses.length)

    // Calculate overall stats
    let totalVideos = 0
    let completedVideos = 0
    let recommendedNext: string | undefined

    transformedCourses.forEach((course: any) => {
      course.modules.forEach((module: any) => {
        module.videos.forEach((video: any) => {
          totalVideos++
          if (video.progress?.completed) {
            completedVideos++
          } else if (!recommendedNext) {
            recommendedNext = video.id
          }
        })
      })
    })

    const result: CoursesResponse = {
      courses: transformedCourses,
      recommendedNext,
      totalCourses: transformedCourses.length,
      totalLessons: totalVideos,
      completedLessons: completedVideos,
      overallProgress: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
    }

    console.log('🎓 Training Courses API - Final result:', {
      coursesCount: result.courses.length,
      totalLessons: result.totalLessons,
      completedLessons: result.completedLessons,
      overallProgress: result.overallProgress
    })

    return apiResponse(result, 200)
  } catch (error) {
    console.error('🎓 Training courses API error:', error)
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
