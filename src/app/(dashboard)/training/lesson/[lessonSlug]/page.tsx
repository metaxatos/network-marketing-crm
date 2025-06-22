import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LessonDisplay } from './lesson-display'
import type { VideoPlatform } from '@/types/training'

interface LessonData {
  id: string
  title: string
  lesson_order: number
  slug: string
}

interface LessonPageProps {
  params: {
    lessonSlug: string
  }
}

// Server Component - eliminates 502 errors on refresh
export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = params
  
  if (!lessonSlug) {
    notFound()
  }

  try {
    // Fetch data on server using admin client (no auth session, no document access)
    const supabase = createAdminClient()
    
    console.log('🎓 [Server] Fetching lesson directly from Supabase:', lessonSlug)
    
    // Single optimized query to get video with course info
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
      .single()

    if (videoError) {
      console.error('🎓 [Server] Video query error:', videoError)
      if (videoError.code === 'PGRST116') {
        notFound()
      }
      throw new Error('Failed to load lesson data')
    }

    if (!videoData) {
      notFound()
    }

    console.log('🎓 [Server] Found video:', videoData.title)

    // Get all lessons in this course for navigation
    const { data: allLessons, error: lessonsError } = await supabase
      .from('training_videos')
      .select('id, title, lesson_order, slug')
      .eq('course_id', videoData.course_id)
      .eq('is_published', true)
      .order('lesson_order')

    if (lessonsError) {
      console.error('🎓 [Server] Lessons query error:', lessonsError)
      // Don't fail the whole page for navigation data
    }

    // Find current lesson index and next/previous lessons
    const currentIndex = allLessons?.findIndex((lesson: LessonData) => lesson.id === videoData.id) ?? -1
    const nextLesson = currentIndex >= 0 && allLessons && currentIndex < allLessons.length - 1 
      ? allLessons[currentIndex + 1] 
      : null
    const previousLesson = currentIndex > 0 && allLessons
      ? allLessons[currentIndex - 1] 
      : null

    // Build props for client component
    const videoProps = {
      video: {
        ...videoData,
        course: videoData.courses[0] // Get first (and only) course from the join
      },
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
        allLessons: (allLessons || []).map((lesson: LessonData) => ({
          id: lesson.id,
          title: lesson.title,
          lesson_order: lesson.lesson_order,
          slug: lesson.slug
        }))
      }
    }

    return (
      <ErrorBoundary>
        <LessonDisplay {...videoProps} />
      </ErrorBoundary>
    )
    
  } catch (error) {
    console.error('🚨 [Server] Lesson page error:', error)
    notFound()
  }
} 