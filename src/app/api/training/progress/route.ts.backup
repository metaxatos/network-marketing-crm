import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody } from '@/lib/api-helpers'
import type { TrainingVideo, MemberProgress } from '@/types/training'

// Define simplified progress update request
interface UpdateProgressRequest {
  videoId: string
  progressSeconds: number
  completed?: boolean
}

// GET /api/training/progress - Get user's training progress
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Get all video progress for the user (simplified from course progress)
    const { data: progressData, error } = await supabase
      .from('member_progress')
      .select(`
        *,
        video:training_videos (
          id,
          title,
          description,
          category,
          duration_seconds
        )
      `)
      .eq('member_id', userId)

    if (error) {
      throw error
    }

    // Calculate overall progress from individual video progress
    const totalVideos = progressData?.length || 0
    const completedVideos = progressData?.filter((p: MemberProgress) => p.completed).length || 0
    const totalProgressSeconds = progressData?.reduce((sum: number, p: MemberProgress) => sum + p.progress_seconds, 0) || 0
    
    return apiResponse({
      progress: {
        videosCompleted: completedVideos,
        totalVideos,
        overallCompletion: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) / 100 : 0,
        totalWatchTimeSeconds: totalProgressSeconds,
      },
      videoProgress: progressData?.map((p: MemberProgress) => ({
        videoId: p.video_id,
        progressSeconds: p.progress_seconds,
        completed: p.completed,
        lastWatchedAt: p.last_watched_at,
        videoTitle: (p as any).video?.title,
        videoCategory: (p as any).video?.category,
      })) || [],
    }, 200)
  } catch (error) {
    console.error('Get progress error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to get progress',
      500
    )
  }
})

// POST /api/training/progress - Update video progress
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
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

    // Get video details to verify it exists
    const { data: video } = await supabase
      .from('training_videos')
      .select(`
        id,
        title,
        duration_seconds,
        category,
        company_id
      `)
      .eq('id', body.videoId)
      .single()

    if (!video) {
      return apiError('Video not found', 404)
    }

    // Check for existing progress record
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

    // Log activity if video was just completed
    if (body.completed && (!existingProgress || !existingProgress.completed)) {
      try {
        await supabase.from('communications').insert({
          member_id: userId,
          type: 'activity',
          subject: 'Training Progress',
          content: `Completed training video: ${video.title}`,
          metadata: {
            activity_type: 'training_completed',
            video_id: video.id,
            video_title: video.title,
            video_category: video.category,
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