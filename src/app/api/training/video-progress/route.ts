import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'

// POST /api/training/video-progress - Update video watch progress
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createApiClient(req)
    const body = await req.json()
    
    const { videoId, progressSeconds, completed = false } = body
    
    if (!videoId || typeof progressSeconds !== 'number') {
      return apiError('Video ID and progress seconds are required', 400)
    }

    // Check if progress record exists
    const { data: existingProgress } = await supabase
      .from('member_progress')
      .select('*')
      .eq('member_id', userId)
      .eq('video_id', videoId)
      .single()

    let result
    
    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('member_progress')
        .update({
          progress_seconds: progressSeconds,
          completed: completed,
          last_watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('member_id', userId)
        .eq('video_id', videoId)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('member_progress')
        .insert({
          member_id: userId,
          video_id: videoId,
          progress_seconds: progressSeconds,
          completed: completed,
          last_watched_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return apiResponse({
      success: true,
      progress: {
        videoId: result.video_id,
        progressSeconds: result.progress_seconds,
        completed: result.completed,
        lastWatchedAt: result.last_watched_at,
      }
    })
  } catch (error) {
    console.error('Video progress update error:', error)
    return apiError('Failed to update video progress', 500)
  }
}) 