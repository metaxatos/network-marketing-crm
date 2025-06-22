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
    
    // Find the lesson by slug
    const { data: videoData, error: videoError } = await supabase
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
        courses!inner(
          id,
          title,
          description
        )
      `)
      .eq('slug', lessonSlug)
      .eq('is_published', true)
      .single();

    if (videoError) {
      console.error('🎓 Lesson API - Video query error:', videoError)
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    if (!videoData) {
      console.log('🎓 Lesson API - No video found for slug:', lessonSlug)
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    console.log('🎓 Lesson API - Found video:', videoData.title)

    // Get user progress for this video
    const { data: progressData } = await supabase
      .from('member_progress')
      .select('*')
      .eq('member_id', user.id)
      .eq('video_id', videoData.id)
      .single()

    // Get all lessons in this course for navigation
    const { data: allLessons } = await supabase
      .from('training_videos')
      .select('id, title, lesson_order, slug')
      .eq('course_id', videoData.course_id)
      .eq('is_published', true)
      .order('lesson_order')

    // Find current lesson index and next/previous lessons
    const currentIndex = allLessons?.findIndex((lesson: LessonData) => lesson.id === videoData.id) ?? -1
    const nextLesson = currentIndex >= 0 && currentIndex < (allLessons?.length ?? 0) - 1 
      ? allLessons?.[currentIndex + 1] 
      : null
    const previousLesson = currentIndex > 0 
      ? allLessons?.[currentIndex - 1] 
      : null

    // Transform data - fix the course reference
    const videoDataWithProgress = {
      ...videoData,
      course: videoData.courses
    }

    console.log('🎓 Lesson API - Returning lesson data for:', videoData.title)
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