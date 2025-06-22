import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * @deprecated This API route is no longer used as of Fix #2 implementation.
 * Video data is now fetched directly from Supabase client-side to eliminate
 * serverless function timeouts and improve performance.
 * 
 * This endpoint is kept for backwards compatibility but may be removed in future versions.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const videoId = params.videoId

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch video details
    const { data: video, error: videoError } = await supabase
      .from('training_videos')
      .select(`
        *,
        course:training_courses(*)
      `)
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      console.error('Video fetch error:', videoError)
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this course - use maybeSingle() to handle no enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', video.course_id)
      .maybeSingle()

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Get user's progress for this video - use maybeSingle() to handle no progress
    const { data: progress } = await supabase
      .from('video_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .maybeSingle()

    // Get next video in the course - use maybeSingle() to handle last video
    const { data: nextVideo } = await supabase
      .from('training_videos')
      .select('id, title')
      .eq('course_id', video.course_id)
      .gt('order_index', video.order_index)
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle()

    // Prepare response data - handle null course gracefully
    const responseData = {
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoPlatform: video.video_platform || 'vimeo',
        vimeoVideoId: video.vimeo_video_id,
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        durationMinutes: video.duration_minutes,
        orderIndex: video.order_index,
        progress: progress ? {
          progressSeconds: progress.progress_seconds,
          completed: progress.completed,
          lastWatchedAt: progress.last_watched_at
        } : null
      },
      course: video.course ? {
        id: video.course.id,
        title: video.course.title,
        description: video.course.description
      } : null,
      nextVideo: nextVideo ? {
        id: nextVideo.id,
        title: nextVideo.title
      } : null
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
