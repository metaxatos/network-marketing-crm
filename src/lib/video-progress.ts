import { createClient } from '@/lib/supabase/client'

export interface VideoProgressUpdate {
  videoId: string
  progressSeconds: number
  completed?: boolean
}

export interface VideoProgressResult {
  member_id: string
  video_id: string
  progress_seconds: number
  completed: boolean
  last_watched_at: string
  created_at: string
  updated_at: string
}

/**
 * Atomically update video progress using Supabase RPC function
 * Prevents race conditions when multiple tabs update the same video
 */
export async function updateVideoProgress(
  update: VideoProgressUpdate
): Promise<VideoProgressResult> {
  const supabase = createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  // Call the atomic upsert function
  const { data, error } = await supabase.rpc('upsert_video_progress', {
    p_member_id: user.id,
    p_video_id: update.videoId,
    p_progress_seconds: Math.max(0, Math.floor(update.progressSeconds)),
    p_completed: update.completed || false
  })

  if (error) {
    console.error('Video progress update error:', error)
    throw new Error('Failed to update video progress')
  }

  return data as VideoProgressResult
}

/**
 * Get all video progress for the current user
 */
export async function getUserVideoProgress() {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

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
    .eq('member_id', user.id)

  if (error) {
    console.error('Get video progress error:', error)
    // Return empty progress instead of throwing - graceful degradation
    return {
      progress: {
        videosCompleted: 0,
        totalVideos: 0,
        overallCompletion: 0,
        totalWatchTimeSeconds: 0,
      },
      videoProgress: [],
    }
  }

  // Calculate overall progress
  const totalVideos = (progressData || []).length
  const completedVideos = (progressData || []).filter((p: any) => p.completed).length
  const totalProgressSeconds = (progressData || []).reduce((sum: number, p: any) => sum + (p.progress_seconds || 0), 0)
  
  return {
    progress: {
      videosCompleted: completedVideos,
      totalVideos,
      overallCompletion: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) / 100 : 0,
      totalWatchTimeSeconds: totalProgressSeconds,
    },
    videoProgress: (progressData || []).map((p: any) => ({
      videoId: p.video_id,
      progressSeconds: p.progress_seconds || 0,
      completed: p.completed || false,
      lastWatchedAt: p.last_watched_at,
      videoTitle: p.video?.title,
      moduleTitle: p.video?.module_name,
      courseTitle: (p.video?.course as any)?.title || 'Unknown Course',
    })),
  }
}

/**
 * Performance monitoring wrapper
 * Tracks query performance and success rates
 */
export async function updateVideoProgressWithMetrics(
  update: VideoProgressUpdate
): Promise<VideoProgressResult> {
  const startTime = performance.now()
  
  try {
    const result = await updateVideoProgress(update)
    
    // Track successful update
    const duration = performance.now() - startTime
    console.log(`Video progress update completed in ${duration.toFixed(2)}ms`)
    
    // Could add analytics tracking here if needed
    // analytics.track('video_progress_update', { duration, success: true })
    
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`Video progress update failed after ${duration.toFixed(2)}ms:`, error)
    
    // Track failed update
    // analytics.track('video_progress_update', { duration, success: false, error: error.message })
    
    throw error
  }
} 