import { Suspense } from 'react'
import { notFound } from 'next/navigation'
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

// Direct HTTP call to Supabase REST API (no client, no browser APIs)
async function fetchFromSupabase(endpoint: string, params: Record<string, string> = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase configuration')
  }
  
  const url = new URL(`${supabaseUrl}/rest/v1/${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })
  
  const response = await fetch(url.toString(), {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Supabase API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

// Server Component - eliminates 502 errors on refresh
export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = params
  
  if (!lessonSlug) {
    console.log('🚨 [Server] No lesson slug provided')
    notFound()
  }

  try {
    console.log('🎓 [Server] Fetching lesson via direct HTTP:', lessonSlug)
    
    // Direct HTTP call - no Supabase client, no browser APIs
    const videoData = await fetchFromSupabase('training_videos', {
      'slug': `eq.${lessonSlug}`,
      'is_published': 'eq.true',
      'select': 'id,title,description,video_url,video_platform,thumbnail_url,duration_seconds,lesson_order,course_id,slug',
      'limit': '1'
    })

    if (!videoData || videoData.length === 0) {
      console.log('🎓 [Server] Video not found for slug:', lessonSlug)
      notFound()
    }

    const video = videoData[0]
    console.log('🎓 [Server] Found video:', video.title, 'Course ID:', video.course_id)

    // Get course information
    let courseData = null
    try {
      const courseResult = await fetchFromSupabase('courses', {
        'id': `eq.${video.course_id}`,
        'select': 'id,title,description',
        'limit': '1'
      })
      courseData = courseResult[0] || null
    } catch (error) {
      console.error('🎓 [Server] Course query error:', error)
    }

    // Get all lessons in this course for navigation
    let allLessons = []
    try {
      allLessons = await fetchFromSupabase('training_videos', {
        'course_id': `eq.${video.course_id}`,
        'is_published': 'eq.true',
        'select': 'id,title,lesson_order,slug',
        'order': 'lesson_order'
      })
    } catch (error) {
      console.error('🎓 [Server] Lessons query error:', error)
    }

    // Find current lesson index and next/previous lessons
    const currentIndex = allLessons.findIndex((lesson: LessonData) => lesson.id === video.id)
    const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 
      ? allLessons[currentIndex + 1] 
      : null
    const previousLesson = currentIndex > 0
      ? allLessons[currentIndex - 1] 
      : null

    // Build props for client component with defensive programming
    const videoProps = {
      video: {
        ...video,
        // Ensure all required fields are present
        title: video.title || 'Untitled Lesson',
        description: video.description || '',
        video_url: video.video_url || '',
        video_platform: (video.video_platform as VideoPlatform) || 'youtube',
        thumbnail_url: video.thumbnail_url || '',
        duration_seconds: video.duration_seconds || 0,
        course: courseData ? {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description || ''
        } : {
          id: video.course_id,
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
        allLessons: allLessons.map((lesson: LessonData) => ({
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