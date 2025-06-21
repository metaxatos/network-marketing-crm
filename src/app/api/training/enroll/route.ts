import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody } from '@/lib/api-helpers'

// Define simplified video access request
interface AccessVideoRequest {
  videoId: string
}

// POST /api/training/enroll - Start watching a video (using our SIMPLIFIED video structure)
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Validate request body
    const body = await validateBody<AccessVideoRequest>(req, (data) => {
      if (!data.videoId) {
        throw new Error('Video ID is required')
      }

      return {
        videoId: data.videoId,
      }
    })

    // Verify video exists using our SIMPLIFIED training_videos table
    const { data: video } = await supabase
      .from('training_videos')
      .select(`
        id, 
        title, 
        is_published,
        module_name,
        course_id,
        course:courses (
          title,
          is_published
        )
      `)
      .eq('id', body.videoId)
      .eq('is_published', true)
      .single()

    if (!video || (video.course_id && !video.course?.is_published)) {
      return apiError('Video not found or not available', 404)
    }

    // Check if user already has progress record for this video using our SIMPLIFIED member_progress table
    const { data: existingProgress } = await supabase
      .from('member_progress')
      .select('member_id, video_id, created_at')
      .eq('member_id', userId)
      .eq('video_id', body.videoId)
      .single()

    if (existingProgress) {
      return apiResponse({
        message: 'Video access confirmed',
        video: {
          id: video.id,
          title: video.title,
          moduleTitle: video.module_name,
          courseTitle: video.course?.title,
          hasExistingProgress: true,
          firstAccessedAt: existingProgress.created_at,
        },
      }, 200)
    }

    // Create initial progress record using our SIMPLIFIED member_progress table
    const { data: newProgress, error } = await supabase
      .from('member_progress')
      .insert({
        member_id: userId,
        video_id: body.videoId,
        progress_seconds: 0,
        completed: false,
        last_watched_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log activity for starting a new video using our existing communications table
    try {
      await supabase.from('communications').insert({
        member_id: userId,
        type: 'status_change',
        subject: 'Training Started',
        content: `Started watching training video: ${video.title}`,
        metadata: {
          activity_type: 'training_started',
          video_id: video.id,
          video_title: video.title,
          module_title: video.module_name,
          course_title: video.course?.title,
        },
      })
    } catch (logError) {
      console.warn('Failed to log training start:', logError)
      // Don't fail the request if logging fails
    }

    return apiResponse({
      message: 'Video access granted',
      video: {
        id: video.id,
        title: video.title,
        moduleTitle: video.module_name,
        courseTitle: video.course?.title,
        hasExistingProgress: false,
        firstAccessedAt: newProgress.created_at,
      },
    }, 201)
  } catch (error) {
    console.error('Video access error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to access video',
      400
    )
  }
})
