'use client';

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, SkipForward } from 'lucide-react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { useAuth } from '@/hooks'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const lessonSlug = params.lessonSlug as string
  const [videoData, setVideoData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch video data by lesson slug
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!lessonSlug || !user) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/training/lesson/${lessonSlug}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        
        if (result.video) {
          setVideoData(result)
        } else {
          throw new Error(result.error || 'Failed to load lesson')
        }
      } catch (err) {
        console.error('🚨 Lesson fetch error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred loading the lesson')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchVideoData()
    } else if (!authLoading && !user) {
      setError('Please log in to access training lessons')
      setIsLoading(false)
    }
  }, [lessonSlug, user, authLoading])

  const handleBackToCourse = () => {
    if (!videoData?.course?.id) return
    router.push(`/training/course/${videoData.course.id}`)
  }

  const handleNextLesson = () => {
    if (!videoData?.navigation?.nextLesson?.slug) return
    router.push(`/training/lesson/${videoData.navigation.nextLesson.slug}`)
  }

  // Show auth loading state
  if (authLoading) {
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

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Lesson</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/training')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Training
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show loading state
  if (isLoading || !videoData) {
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

  const renderVideo = () => {
    const { video } = videoData
    
    if (video.video_platform === 'vimeo' && video.vimeo_video_id) {
      const vimeoUrl = `https://player.vimeo.com/video/${video.vimeo_video_id}`
      
      return (
        <iframe
          src={vimeoUrl}
          className="w-full aspect-video rounded-lg shadow-lg"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={video.title || 'Training Video'}
        />
      )
    }
    
    if (video.video_url) {
      return (
        <video
          className="w-full aspect-video rounded-lg shadow-lg"
          controls
          poster={video.thumbnail_url || undefined}
        >
          <source src={video.video_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )
    }
    
    return (
      <div className="w-full aspect-video rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Video not available</p>
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

          {/* Video Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {videoData?.video?.title || 'Loading...'}
                </h2>
                {videoData?.video?.description && (
                  <p className="text-gray-600 mb-4">
                    {videoData.video.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor((videoData?.video?.duration_seconds || 0) / 60)} minutes</span>
                  </div>
                  {videoData?.progress?.completed && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBackToCourse}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Course
            </button>
            
            {videoData?.navigation?.nextLesson && (
              <button
                onClick={handleNextLesson}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
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