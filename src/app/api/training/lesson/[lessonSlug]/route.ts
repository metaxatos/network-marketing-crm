import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function GET(req: NextRequest, { params }: { params: { lessonSlug: string } }) {
  try {
    const { lessonSlug } = params
    
    if (!lessonSlug) {
      return NextResponse.json({ error: 'Lesson slug is required' }, { status: 400 })
    }

    // Get current user from auth
    const supabase = await createApiClient(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🎓 Lesson API - Fetching lesson:', lessonSlug, 'for user:', user.id)
    
    // Convert slug back to searchable title
    const searchTitle = lessonSlug.split('-').join(' ')
    
    // Find the video by title match
    const { data: videos, error: videoError } = await supabase
      .from('training_videos')
      .select(`
        id,
        title,
        description,
        video_url,
        video_platform,
        vimeo_video_id,
        thumbnail_url,
        duration_seconds,
        course_id,
        lesson_order,
        courses (
          id,
          title
        )
      `)
      .eq('is_published', true)
      .ilike('title', `%${searchTitle}%`)
      .order('lesson_order', { ascending: true })

    if (videoError) {
      console.error('🎓 Lesson API - Video query error:', videoError)
      return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 })
    }

    if (!videos || videos.length === 0) {
      console.log('🎓 Lesson API - No video found for slug:', lessonSlug)
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const video = videos[0] as any
    console.log('🎓 Lesson API - Found video:', video.title)

    // Get user progress for this video
    const { data: progressData } = await supabase
      .from('member_progress')
      .select('progress_seconds, completed, last_watched_at')
      .eq('member_id', user.id)
      .eq('video_id', video.id)
      .single()

    // Find next video in the same course
    const { data: nextVideos } = await supabase
      .from('training_videos')
      .select('id, title, lesson_order')
      .eq('course_id', video.course_id)
      .eq('is_published', true)
      .gt('lesson_order', video.lesson_order)
      .order('lesson_order', { ascending: true })
      .limit(1)

    // Transform data
    const videoData = {
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.video_url,
        videoPlatform: video.video_platform,
        vimeoVideoId: video.vimeo_video_id,
        thumbnailUrl: video.thumbnail_url,
        durationSeconds: video.duration_seconds,
        progress: progressData ? {
          progressSeconds: progressData.progress_seconds || 0,
          completed: progressData.completed || false
        } : undefined
      },
      course: {
        id: video.courses?.id || '',
        title: video.courses?.title || ''
      },
      nextVideo: nextVideos && nextVideos[0] ? {
        id: nextVideos[0].id,
        title: nextVideos[0].title,
        slug: nextVideos[0].title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      } : undefined
    }

    console.log('🎓 Lesson API - Returning lesson data for:', video.title)
    return NextResponse.json({ success: true, data: videoData })

  } catch (error) {
    console.error('🎓 Lesson API - Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 