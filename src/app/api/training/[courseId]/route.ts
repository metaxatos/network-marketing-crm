import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'

// GET /api/training/[courseId] - Get course details
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const courseId = req.nextUrl.pathname.split('/').pop()
    
    if (!courseId) {
      return apiError('Course ID is required', 400)
    }

    const supabase = await createClient()
    
    // Get member's company ID
    const member = await getCurrentMember(userId)
    
    if (!member?.company_id) {
      return apiError('Company not found', 404)
    }

    // Get course details with videos and user progress
    const { data: course, error } = await supabase
      .from('training_courses')
      .select(`
        *,
        course_videos (
          id,
          title,
          video_url,
          duration_seconds,
          order_index
        ),
        member_course_progress (
          completion_percentage,
          last_video_id,
          last_position_seconds,
          completed_videos,
          completed_at
        )
      `)
      .eq('id', courseId)
      .eq('company_id', member.company_id)
      .eq('member_course_progress.member_id', userId)
      .single()

    if (error || !course) {
      return apiError('Course not found', 404)
    }

    // Sort videos by order
    const sortedVideos = course.course_videos?.sort(
      (a: any, b: any) => a.order_index - b.order_index
    ) || []

    // Determine next video to watch
    const progress = course.member_course_progress?.[0]
    let nextVideoId: string | undefined
    
    if (progress && progress.completed_videos) {
      const completedIds = new Set(progress.completed_videos)
      const nextVideo = sortedVideos.find((v: any) => !completedIds.has(v.id))
      nextVideoId = nextVideo?.id
    } else if (sortedVideos.length > 0) {
      nextVideoId = sortedVideos[0].id
    }

    return apiResponse({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnail_url,
        durationMinutes: course.duration_minutes,
        isRequired: course.is_required,
        videos: sortedVideos.map((video: any) => ({
          id: video.id,
          title: video.title,
          videoUrl: video.video_url,
          durationSeconds: video.duration_seconds,
          isCompleted: progress?.completed_videos?.includes(video.id) || false,
        })),
        progress: progress ? {
          completionPercentage: progress.completion_percentage,
          lastVideoId: progress.last_video_id,
          lastPositionSeconds: progress.last_position_seconds,
          completedAt: progress.completed_at,
        } : null,
        nextVideoId,
      },
    }, 200)
  } catch (error) {
    console.error('Get course details error:', error)
    return apiError('Failed to retrieve course details', 500)
  }
}) 