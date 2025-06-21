import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'

// Define types based on our SIMPLIFIED database structure
interface CourseWithVideos {
  id: string
  title: string
  description?: string
  cover_image?: string
  order_index: number
  is_published: boolean
  // Group videos by module
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

// GET /api/training/courses - Using our SIMPLIFIED training structure
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

    // Query using our SIMPLIFIED database structure: courses -> training_videos
    const { data: courses, error } = await supabase
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
          is_published,
          member_progress!member_progress_video_id_fkey (
            progress_seconds,
            completed,
            last_watched_at,
            member_id
          )
        )
      `)
      .eq('is_published', true)
      .eq('training_videos.is_published', true)
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

    // Transform to expected format with modules
    const coursesWithVideos: CourseWithVideos[] = (courses || []).map((course: any) => {
      // Group videos by module_name
      const videosByModule = new Map<string, any[]>()
      const moduleOrders = new Map<string, number>()
      
      ;(course.training_videos || []).forEach((video: any) => {
        const moduleName = video.module_name || 'General'
        if (!videosByModule.has(moduleName)) {
          videosByModule.set(moduleName, [])
          moduleOrders.set(moduleName, video.module_order || 0)
        }

        // FIXED: Find progress for current user only
        const userProgress = video.member_progress?.find((p: any) => p.member_id === userId)
        
        videosByModule.get(moduleName)!.push({
          id: video.id,
          title: video.title,
          description: video.description,
          video_url: video.video_url,
          video_platform: video.video_platform,
          thumbnail_url: video.thumbnail_url,
          duration_seconds: video.duration_seconds,
          order_index: video.order_index,
          lesson_order: video.lesson_order || 0,
          is_required: video.is_required || false,
          progress: userProgress ? {
            progress_seconds: userProgress.progress_seconds,
            completed: userProgress.completed,
            last_watched_at: userProgress.last_watched_at,
          } : undefined,
        })
      })

      // Convert to modules array and sort
      const modules = Array.from(videosByModule.entries())
        .map(([name, videos]) => ({
          name,
          order: moduleOrders.get(name) || 0,
          videos: videos.sort((a, b) => {
            // Sort by lesson_order first, then by order_index
            if (a.lesson_order !== b.lesson_order) {
              return a.lesson_order - b.lesson_order
            }
            return a.order_index - b.order_index
          })
        }))
        .sort((a, b) => a.order - b.order)

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        cover_image: course.cover_image,
        order_index: course.order_index,
        is_published: course.is_published,
        modules
      }
    })

    // Find recommended next video (first uncompleted video)
    let recommendedNext: string | undefined
    for (const course of coursesWithVideos) {
      for (const module of course.modules) {
        for (const video of module.videos) {
          if (!video.progress?.completed) {
            recommendedNext = video.id
            break
          }
        }
        if (recommendedNext) break
      }
      if (recommendedNext) break
    }

    // Calculate overall progress
    let totalVideos = 0
    let completedVideos = 0
    coursesWithVideos.forEach(course => {
      course.modules.forEach(module => {
        module.videos.forEach(video => {
          totalVideos++
          if (video.progress?.completed) {
            completedVideos++
          }
        })
      })
    })

    return apiResponse({
      courses: coursesWithVideos,
      recommendedNext,
      totalCourses: coursesWithVideos.length,
      totalLessons: totalVideos,
      completedLessons: completedVideos,
      overallProgress: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
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
