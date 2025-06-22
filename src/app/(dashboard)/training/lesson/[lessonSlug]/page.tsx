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

// Loading component for the lesson page
function LessonPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Video skeleton */}
          <div className="aspect-video bg-gray-200 animate-pulse" />
          
          {/* Content skeleton */}
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Server Component - eliminates 502 errors on refresh
export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = params
  
  if (!lessonSlug) {
    console.log('🚨 [Server] No lesson slug provided')
    notFound()
  }

  try {
    // Fetch data on server using admin client (no auth session, no document access)
    const supabase = createAdminClient()
    
    console.log('🎓 [Server] Fetching lesson directly from Supabase:', lessonSlug)
    
    // First get the video data
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
        slug
      `)
      .eq('slug', lessonSlug)
      .eq('is_published', true)
      .single()

    if (videoError) {
      console.error('🎓 [Server] Video query error:', videoError)
      if (videoError.code === 'PGRST116') {
        console.log('🎓 [Server] Video not found for slug:', lessonSlug)
        notFound()
      }
      throw new Error(`Failed to load lesson data: ${videoError.message}`)
    }

    if (!videoData) {
      console.log('🎓 [Server] No video data returned for slug:', lessonSlug)
      notFound()
    }

    console.log('🎓 [Server] Found video:', videoData.title, 'Course ID:', videoData.course_id)

    // Get course information separately
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, title, description')
      .eq('id', videoData.course_id)
      .single()

    if (courseError) {
      console.error('🎓 [Server] Course query error:', courseError)
      // Don't fail the whole page for course data
    }

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

    // Build props for client component with defensive programming
    const videoProps = {
      video: {
        ...videoData,
        // Ensure all required fields are present
        title: videoData.title || 'Untitled Lesson',
        description: videoData.description || '',
        video_url: videoData.video_url || '',
        video_platform: (videoData.video_platform as VideoPlatform) || 'youtube',
        thumbnail_url: videoData.thumbnail_url || '',
        duration_seconds: videoData.duration_seconds || 0,
        course: courseData ? {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description || ''
        } : {
          id: videoData.course_id,
          title: 'Unknown Course',
          description: ''
        }
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

    console.log('🎓 [Server] Prepared video props:', {
      videoTitle: videoProps.video.title,
      courseTitle: videoProps.video.course.title,
      hasNavigation: !!videoProps.navigation.allLessons.length
    })

    return (
      <Suspense fallback={<LessonPageSkeleton />}>
        <ErrorBoundary>
          <LessonDisplay {...videoProps} />
        </ErrorBoundary>
      </Suspense>
    )
    
  } catch (error) {
    console.error('🚨 [Server] Lesson page error:', error)
    // In production, we might want to show a proper error page instead of 404
    notFound()
  }
} 