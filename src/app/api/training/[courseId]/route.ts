import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuthWithContext, getCurrentMember } from '@/lib/api-helpers'

// GET /api/training/[courseId] - Get individual training video details (renamed from course details)
export const GET = withAuthWithContext(async (req: NextRequest, userId: string, { params }: { params: { courseId: string } }) => {
  try {
    const supabase = await createClient()
    const { courseId: videoId } = params // Renamed for clarity - this is now a video ID
    
    if (!videoId) {
      return apiError('Video ID is required', 400)
    }

    const member = await getCurrentMember(userId)
    
    if (!member?.company_id) {
      return apiError('Company not found', 404)
    }

    // Get video details with user progress (simplified from course/videos structure)
    const { data: video, error } = await supabase
      .from('training_videos')
      .select(`
        *,
        member_progress!left (
          progress_seconds,
          completed,
          last_watched_at,
          created_at,
          updated_at
        )
      `)
      .eq('id', videoId)
      .or(`company_id.eq.${member.company_id},company_id.is.null`) // Company video or general video
      .eq('is_published', true)
      .eq('member_progress.member_id', userId)
      .single()

    if (error || !video) {
      return apiError('Video not found', 404)
    }

    // Get related videos in the same category for recommendations
    const { data: relatedVideos } = await supabase
      .from('training_videos')
      .select(`
        id,
        title,
        thumbnail_url,
        duration_seconds,
        member_progress!left (
          completed
        )
      `)
      .eq('category', video.category || '')
      .neq('id', videoId)
      .or(`company_id.eq.${member.company_id},company_id.is.null`)
      .eq('is_published', true)
      .eq('member_progress.member_id', userId)
      .order('order_index', { ascending: true })
      .limit(5)

    // Find next recommended video (next uncompleted video in the same category)
    const nextVideo = relatedVideos?.find((v: any) => !v.member_progress?.[0]?.completed)

    const progress = video.member_progress?.[0]

    return apiResponse({
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.video_url,
        videoPlatform: video.video_platform,
        thumbnailUrl: video.thumbnail_url,
        durationSeconds: video.duration_seconds,
        category: video.category,
        orderIndex: video.order_index,
        progress: progress ? {
          progressSeconds: progress.progress_seconds,
          completed: progress.completed,
          lastWatchedAt: progress.last_watched_at,
        } : null,
      },
      relatedVideos: relatedVideos?.map((v: any) => ({
        id: v.id,
        title: v.title,
        thumbnailUrl: v.thumbnail_url,
        durationSeconds: v.duration_seconds,
        isCompleted: v.member_progress?.[0]?.completed || false,
      })) || [],
      nextRecommended: nextVideo ? {
        id: nextVideo.id,
        title: nextVideo.title,
      } : null,
    }, 200)
  } catch (error) {
    console.error('Get video details error:', error)
    return apiError('Failed to retrieve video details', 500)
  }
}) 