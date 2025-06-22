import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

interface LessonData {
  id: string
  title: string
  lesson_order: number
  slug: string
}

export async function GET(req: NextRequest, { params }: { params: { lessonSlug: string } }) {
  try {
    const { lessonSlug } = params
    
    if (!lessonSlug || lessonSlug.trim() === '') {
      return NextResponse.json({ error: 'Lesson slug is required' }, { status: 400 })
    }

    const supabase = await createApiClient(req)

    // Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('🎓 Lesson API - Fetching lesson:', lessonSlug, 'for user:', user.id)
    
    // Find the lesson by slug (fallback to title matching if slug column doesn't exist)
    let videoData = null;
    let videoError = null;

    // First try to find by slug column
    try {
      const { data, error } = await supabase
        .from('training_videos')
        .select(`
          id,
          title,
          description,
          video_url,
          video_platform,
          thumbnail_url,
          duration_seconds,
          lesson_order,
          course_id,
          slug,
          training_courses!inner(
            id,
            title,
            description
          )
        `)
        .eq('slug', lessonSlug)
        .single();
      
      if (!error && data) {
        videoData = data;
      }
    } catch (err) {
      console.log('Slug column might not exist, falling back to title matching');
    }

    // If no result from slug, try to match by generated slug from title
    if (!videoData) {
      const { data: allVideos, error: allVideosError } = await supabase
        .from('training_videos')
        .select(`
          id,
          title,
          description,
          video_url,
          video_platform,
          thumbnail_url,
          duration_seconds,
          lesson_order,
          course_id,
          training_courses!inner(
            id,
            title,
            description
          )
        `)
        .eq('is_published', true);

      if (allVideosError) {
        videoError = allVideosError;
      } else if (allVideos) {
        // Find video by matching generated slug
        videoData = allVideos.find(video => {
          const generatedSlug = video.title
            ?.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .trim();
          return generatedSlug === lessonSlug;
        });
      }
    }

    if (videoError) {
      console.error('🎓 Lesson API - Video query error:', videoError)
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    if (!videoData) {
      console.log('🎓 Lesson API - No video found for slug:', lessonSlug)
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const video = videoData as any
    console.log('🎓 Lesson API - Found video:', video.title)

    // Get user progress for this video
    const { data: progressData } = await supabase
      .from('member_progress')
      .select('*')
      .eq('member_id', user.id)
      .eq('video_id', video.id)
      .single()

    // Get all lessons in this course for navigation
    const { data: allLessons } = await supabase
      .from('training_videos')
      .select('id, title, lesson_order, slug')
      .eq('course_id', video.course_id)
      .order('lesson_order')

    // Find current lesson index and next/previous lessons
    const currentIndex = allLessons?.findIndex((lesson: LessonData) => lesson.id === video.id) ?? -1
    const nextLesson = currentIndex >= 0 && currentIndex < (allLessons?.length ?? 0) - 1 
      ? allLessons?.[currentIndex + 1] 
      : null
    const previousLesson = currentIndex > 0 
      ? allLessons?.[currentIndex - 1] 
      : null

    // Transform data
    const videoDataWithProgress = {
      ...video,
      course: video.training_courses
    }

    console.log('🎓 Lesson API - Returning lesson data for:', video.title)
    return NextResponse.json({
      video: videoDataWithProgress,
      progress: progressData || null,
      navigation: {
        nextLesson: nextLesson ? {
          id: nextLesson.id,
          title: nextLesson.title,
          slug: nextLesson.slug
        } : null,
        previousLesson: previousLesson ? {
          id: previousLesson.id,
          title: previousLesson.title,
          slug: previousLesson.slug
        } : null,
        allLessons: allLessons?.map((lesson: LessonData) => ({
          id: lesson.id,
          title: lesson.title,
          lesson_order: lesson.lesson_order,
          slug: lesson.slug
        })) || []
      }
    })

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