import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, withAuth, validateBody } from '@/lib/api-helpers'

// Define simplified progress update request
interface UpdateProgressRequest {
  videoId: string
  progressSeconds: number
  completed?: boolean
}

// GET /api/training/progress - Get user's training progress using SIMPLIFIED tables
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createApiClient(req)
    
    // Get all video progress for the user using our SIMPLIFIED member_progress table
    const { data: progressData, error } = await supabase
      .from('member_progress')
      .select(`
        *,
        video:training_videos (
          id,
          title,
          description,
          duration_seconds,
          module_name,
          course_id,
          course:courses (
            title
          )
        )
      `)
      .eq('member_id', userId)

    if (error) {
      console.error('Training progress API - Database error:', error)
      // Return safe fallback if database query fails
      return apiResponse({
        progress: {
          videosCompleted: 0,
          totalVideos: 0,
          overallCompletion: 0,
          totalWatchTimeSeconds: 0,
        },
        videoProgress: [],
      }, 200)
    }

    // Calculate overall progress from individual video progress (handle null/undefined safely)
    const totalVideos = (progressData || []).length
    const completedVideos = (progressData || []).filter((p: any) => p.completed).length
    const totalProgressSeconds = (progressData || []).reduce((sum: number, p: any) => sum + (p.progress_seconds || 0), 0)
    
    return apiResponse({
      progress: {
        videosCompleted: completedVideos,
        totalVideos,
        overallCompletion: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) / 100 : 0,
        totalWatchTimeSeconds: totalProgressSeconds,
      },
      // Return video progress in format compatible with frontend
      videoProgress: (progressData || []).map((p: any) => ({
        videoId: p.video_id,
        progressSeconds: p.progress_seconds || 0,
        completed: p.completed || false,
        lastWatchedAt: p.last_watched_at,
        videoTitle: p.video?.title,
        moduleTitle: p.video?.module_name,
        courseTitle: (p.video?.course as any)?.title || 'Unknown Course',
      })),
    }, 200)
  } catch (error) {
    console.error('Get progress error:', error)
    // Return safe fallback instead of 500 error
    return apiResponse({
      progress: {
        videosCompleted: 0,
        totalVideos: 0,
        overallCompletion: 0,
        totalWatchTimeSeconds: 0,
      },
      videoProgress: [],
    }, 200)
  }
})

// POST /api/training/progress - Update video progress using SIMPLIFIED tables
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createApiClient(req)
    
    // Validate request body
    const body = await validateBody<UpdateProgressRequest>(req, (data) => {
      if (!data.videoId || typeof data.progressSeconds !== 'number') {
        throw new Error('Video ID and progress seconds are required')
      }

      return {
        videoId: data.videoId,
        progressSeconds: Math.max(0, data.progressSeconds),
        completed: data.completed || false,
      }
    })

    // Get video details to verify it exists using our SIMPLIFIED training_videos table
    const { data: video } = await supabase
      .from('training_videos')
      .select(`
        id,
        title,
        duration_seconds,
        module_name,
        course_id,
        course:courses (
          title
        )
      `)
      .eq('id', body.videoId)
      .single()

    if (!video) {
      return apiError('Video not found', 404)
    }

    // Check for existing progress record in our SIMPLIFIED member_progress table
    const { data: existingProgress } = await supabase
      .from('member_progress')
      .select('*')
      .eq('member_id', userId)
      .eq('video_id', body.videoId)
      .single()

    let progressData
    
    if (existingProgress) {
      // Update existing progress
      const { data: updatedProgress, error } = await supabase
        .from('member_progress')
        .update({
          progress_seconds: body.progressSeconds,
          completed: body.completed,
          last_watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('member_id', userId)
        .eq('video_id', body.videoId)
        .select()
        .single()

      if (error) {
        throw error
      }
      progressData = updatedProgress
    } else {
      // Create new progress record
      const { data: newProgress, error } = await supabase
        .from('member_progress')
        .insert({
          member_id: userId,
          video_id: body.videoId,
          progress_seconds: body.progressSeconds,
          completed: body.completed,
          last_watched_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }
      progressData = newProgress
    }

    // Log activity if video was just completed using our existing communications table
    if (body.completed && (!existingProgress || !existingProgress.completed)) {
      try {
        await supabase.from('communications').insert({
          member_id: userId,
          type: 'status_change',
          subject: 'Training Progress',
          content: `Completed training video: ${video.title}`,
          metadata: {
            activity_type: 'training_completed',
            video_id: video.id,
            video_title: video.title,
            module_title: video.module_name,
            course_title: (video.course as any)?.title || 'Unknown Course',
          },
        })
      } catch (logError) {
        console.warn('Failed to log training completion:', logError)
        // Don't fail the request if logging fails
      }
    }

    return apiResponse({
      progress: {
        videoId: progressData.video_id,
        progressSeconds: progressData.progress_seconds,
        completed: progressData.completed,
        lastWatchedAt: progressData.last_watched_at,
      },
    }, 200)
  } catch (error) {
    console.error('Update progress error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to update progress',
      400
    )
  }
})
