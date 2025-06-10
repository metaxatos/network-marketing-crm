import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody } from '@/lib/api-helpers'
import type { UpdateProgressRequest, TrainingProgressResponse } from '@/types/api'

// POST /api/training/progress - Update lesson progress
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Validate request body
    const body = await validateBody<UpdateProgressRequest>(req, (data) => {
      if (!data.videoId || typeof data.positionSeconds !== 'number') {
        throw new Error('Video ID and position are required')
      }

      return {
        videoId: data.videoId,
        positionSeconds: Math.max(0, data.positionSeconds),
        completed: data.completed || false,
      }
    })

    // Get video details with course info
    const { data: video } = await supabase
      .from('course_videos')
      .select(`
        id,
        course_id,
        title,
        duration_seconds,
        order_index,
        course:training_courses (
          id,
          title
        )
      `)
      .eq('id', body.videoId)
      .single()

    if (!video) {
      return apiError('Video not found', 404)
    }

    // Check if user is enrolled in the course
    const { data: progress } = await supabase
      .from('member_course_progress')
      .select('*')
      .eq('member_id', userId)
      .eq('course_id', video.course_id)
      .single()

    if (!progress) {
      return apiError('Not enrolled in this course', 403)
    }

    // Get all videos in the course for progress calculation
    const { data: allVideos } = await supabase
      .from('course_videos')
      .select('id')
      .eq('course_id', video.course_id)

    const totalVideos = allVideos?.length || 0
    let completedVideos = progress.completed_videos || []

    // Update completed videos list if marked as completed
    if (body.completed && !completedVideos.includes(body.videoId)) {
      completedVideos = [...completedVideos, body.videoId]
    }

    // Calculate completion percentage
    const completionPercentage = totalVideos > 0 
      ? completedVideos.length / totalVideos 
      : 0

    // Update progress
    const { data: updatedProgress, error } = await supabase
      .from('member_course_progress')
      .update({
        last_video_id: body.videoId,
        last_position_seconds: body.positionSeconds,
        completed_videos: completedVideos,
        completion_percentage: completionPercentage,
        completed_at: completionPercentage === 1 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('member_id', userId)
      .eq('course_id', video.course_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log activity if course completed
    if (completionPercentage === 1 && progress.completion_percentage < 1) {
      await supabase.from('member_activities').insert({
        member_id: userId,
        activity_type: 'training_completed',
        metadata: {
          course_id: video.course_id,
          course_title: video.course?.[0]?.title,
        },
      })
    }

    const response: TrainingProgressResponse = {
      progress: {
        courseCompletion: Math.round(completionPercentage * 100) / 100,
        videosCompleted: completedVideos.length,
        totalVideos,
      },
    }

    return apiResponse(response, 200)
  } catch (error) {
    console.error('Update progress error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to update progress',
      400
    )
  }
}) 