import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { apiResponse } from '@/lib/api-helpers'

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
export const GET = async (req: NextRequest) => {
  try {
    console.log('🎓 Training Courses API - Starting (bypassing auth for testing)...')
    
    const supabase = createAdminClient()
    
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
      console.error('❌ Error fetching courses:', coursesError)
      return apiResponse({ error: 'Failed to fetch courses' }, 500)
    }

    console.log(`✅ Found ${courses?.length || 0} courses`)

    // Transform the data to organize videos by modules
    const transformedCourses = courses?.map(course => {
      const videos = course.training_videos || []
      
      // Group videos by module
      const moduleMap = new Map()
      
      videos.forEach(video => {
        const moduleKey = video.module_name || 'General'
        if (!moduleMap.has(moduleKey)) {
          moduleMap.set(moduleKey, {
            name: moduleKey,
            order: video.module_order || 0,
            videos: []
          })
        }
        moduleMap.get(moduleKey).videos.push(video)
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

    console.log(`🎥 Transformed courses with modules:`, transformedCourses.length)

    return apiResponse(transformedCourses, 200)
  } catch (error) {
    console.error('❌ Training courses API error:', error)
    return apiResponse({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, 500)
  }
}
