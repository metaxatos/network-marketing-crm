'use client';

import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, SkipForward } from 'lucide-react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { useAuth } from '@/hooks'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { VideoPlayer } from '@/components/training/video-player'
import type { VideoPlatform } from '@/types/training'
import { createClient } from '@/lib/supabase/client'

interface LessonData {
  id: string
  title: string
  lesson_order: number
  slug: string
}

// Loading component for better UX
function LessonLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-96 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Error component for better error handling
function LessonError({ error, retry }: { error: string; retry: () => void }) {
  const router = useRouter()
  
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Lesson</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <button
                onClick={retry}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/training')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Training
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Main lesson component
function LessonContent() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const lessonSlug = params.lessonSlug as string
  const [videoData, setVideoData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Fetch video data directly from Supabase (eliminates serverless function bottleneck)
  const fetchVideoData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Don't fetch if no user or lessonSlug
      if (!lessonSlug || !user) {
        if (!user && !authLoading) {
          throw new Error('Please log in to access training lessons')
        }
        return
      }

      const supabase = createClient()
      
      console.log('🎓 Fetching lesson directly from Supabase:', lessonSlug)
      
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
        console.error('🎓 Video query error:', videoError)
        if (videoError.code === 'PGRST116') {
          throw new Error('Lesson not found. Please check the URL or try again.')
        }
        throw new Error('Failed to load lesson data')
      }

      if (!videoData) {
        throw new Error('Lesson not found')
      }

      console.log('🎓 Found video:', videoData.title)

      // Get user progress in parallel with lesson navigation
      const [progressResult, lessonsResult] = await Promise.all([
        // User progress for this video
        supabase
          .from('member_progress')
          .select('*')
          .eq('member_id', user.id)
          .eq('video_id', videoData.id)
          .maybeSingle(),
        
        // All lessons in this course for navigation
        supabase
          .from('training_videos')
          .select('id, title, lesson_order, slug')
          .eq('course_id', videoData.course_id)
          .eq('is_published', true)
          .order('lesson_order')
      ])

      const progressData = progressResult.data
      const allLessons = lessonsResult.data || []

      // Find current lesson index and next/previous lessons
      const currentIndex = allLessons.findIndex((lesson: LessonData) => lesson.id === videoData.id)
      const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 
        ? allLessons[currentIndex + 1] 
        : null
      const previousLesson = currentIndex > 0 
        ? allLessons[currentIndex - 1] 
        : null

      // Build result object
      const result = {
        video: {
          ...videoData,
          course: videoData.courses // Fix the course reference
        },
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
          allLessons: allLessons.map((lesson: LessonData) => ({
            id: lesson.id,
            title: lesson.title,
            lesson_order: lesson.lesson_order,
            slug: lesson.slug
          }))
        }
      }

      setVideoData(result)
      
    } catch (err) {
      console.error('🚨 Lesson fetch error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred loading the lesson')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Retry function
  const retryFetch = () => {
    setRetryCount(prev => prev + 1)
    fetchVideoData()
  }

  useEffect(() => {
    // Wait for auth to be ready before fetching
    if (!authLoading) {
      fetchVideoData()
    }
  }, [lessonSlug, user, authLoading, retryCount])

  const handleBackToCourse = () => {
    if (!videoData?.course?.id) {
      router.push('/training')
      return
    }
    router.push(`/training/course/${videoData.course.id}`)
  }

  const handleNextLesson = () => {
    if (!videoData?.navigation?.nextLesson?.slug) return
    router.push(`/training/lesson/${videoData.navigation.nextLesson.slug}`)
  }

  // Show auth loading state
  if (authLoading) {
    return <LessonLoading />
  }

  // Show error state
  if (error) {
    return <LessonError error={error} retry={retryFetch} />
  }

  // Show loading state
  if (isLoading || !videoData) {
    return <LessonLoading />
  }

  const renderVideo = () => {
    const { video } = videoData
    
    // Use the unified VideoPlayer component for all video types
    if (video.video_platform && video.video_url) {
      return (
        <VideoPlayer
          videoId={video.id}
          url={video.video_url}
          platform={video.video_platform as VideoPlatform}
          initialProgress={videoData.progress?.progress_seconds || 0}
          autoSave={true}
          onProgress={(seconds) => {
            // Optional: Add any additional progress handling here
            console.log('Video progress:', seconds)
          }}
          onEnd={() => {
            // Optional: Handle video completion
            console.log('Video ended')
          }}
        />
      )
    }
    
    return (
      <div className="w-full aspect-video rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Video not available</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBackToCourse}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {videoData?.video?.title || 'Loading...'}
              </h1>
              <p className="text-sm text-gray-600">
                Course: {videoData?.course?.title || 'Loading...'}
              </p>
            </div>
          </div>

          {/* Video Player */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6">
              {renderVideo()}
            </div>
          </div>

          {/* Lesson Description */}
          {videoData?.video?.description && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Lesson</h2>
              <p className="text-gray-600 leading-relaxed">{videoData.video.description}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBackToCourse}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <BookOpen className="w-4 h-4" />
              Back to Course
            </button>
            
            {videoData?.navigation?.nextLesson && (
              <button
                onClick={handleNextLesson}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Next Lesson
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Main export with error boundary
export default function LessonPage() {
  return (
    <ErrorBoundary 
      fallback={({ error, resetError }) => (
        <LessonError 
          error={error?.message || "Something went wrong. Please try refreshing the page."} 
          retry={resetError} 
        />
      )}
    >
      <Suspense fallback={<LessonLoading />}>
        <LessonContent />
      </Suspense>
    </ErrorBoundary>
  )
} 