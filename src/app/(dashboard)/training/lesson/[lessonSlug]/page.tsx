'use client';

import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, SkipForward } from 'lucide-react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { useAuth } from '@/hooks'
import { ErrorBoundary } from '@/components/ErrorBoundary'

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

  // Fetch video data by lesson slug
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
      
      const response = await fetch(`/api/training/lesson/${lessonSlug}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000)
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Lesson not found. Please check the URL or try again.')
        }
        if (response.status === 401) {
          throw new Error('Please log in to access this lesson.')
        }
        const errorText = await response.text()
        throw new Error(`Failed to load lesson: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      
      if (result.video) {
        setVideoData(result)
      } else {
        throw new Error(result.error || 'Failed to load lesson data')
      }
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
    
    if (video.video_platform === 'vimeo' && video.vimeo_video_id) {
      // Enhanced Vimeo URL with parameters for better playback
      const vimeoUrl = `https://player.vimeo.com/video/${video.vimeo_video_id}?title=0&byline=0&portrait=0&autoplay=0&loop=0&muted=0&controls=1&responsive=1`
      
      return (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={vimeoUrl}
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={video.title || 'Training Video'}
            loading="lazy"
          />
        </div>
      )
    }
    
    if (video.video_url) {
      return (
        <video
          className="w-full aspect-video rounded-lg shadow-lg"
          controls
          poster={video.thumbnail_url || undefined}
          preload="metadata"
        >
          <source src={video.video_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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