'use client';

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, BookOpen, SkipForward } from 'lucide-react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { useAuth } from '@/hooks'
import { VideoPlayer } from '@/components/training/video-player'
import type { VideoPlatform } from '@/types/training'
import { createClient } from '@/lib/supabase/client'

function VideoPageContent() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const videoId = params.videoId as string
  
  const [videoData, setVideoData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentProgress, setCurrentProgress] = useState(0)

  // Fetch video data directly from Supabase (eliminates serverless function bottleneck)
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId || !user) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        console.log('🎬 Fetching video directly from Supabase:', videoId)

        // Optimized parallel queries to fetch all needed data at once
        const [videoResult, enrollmentResult, progressResult] = await Promise.all([
          // Get video with course info
          supabase
            .from('training_videos')
            .select(`
              id,
              title,
              description,
              video_platform,
              vimeo_video_id,
              video_url,
              thumbnail_url,
              duration_minutes,
              order_index,
              course_id,
              courses:training_courses(
                id,
                title,
                description
              )
            `)
            .eq('id', videoId)
            .single(),

          // Check course enrollment
          supabase
            .from('course_enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', videoId) // This will be corrected after we get the video data
            .maybeSingle(),

          // Get user progress
          supabase
            .from('video_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('video_id', videoId)
            .maybeSingle()
        ])

        const { data: video, error: videoError } = videoResult
        
        if (videoError || !video) {
          console.error('🎬 Video query error:', videoError)
          if (videoError?.code === 'PGRST116') {
            throw new Error('Video not found')
          }
          throw new Error('Failed to load video')
        }

        // Now check enrollment with correct course_id
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', video.course_id)
          .maybeSingle()

        // For now, skip enrollment check in development
        // TODO: Re-enable for production if needed
        // if (!enrollment) {
        //   throw new Error('Not enrolled in this course')
        // }

        const { data: progress } = progressResult

        // Get next video in parallel
        const { data: nextVideo } = await supabase
          .from('training_videos')
          .select('id, title')
          .eq('course_id', video.course_id)
          .gt('order_index', video.order_index)
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle()

        // Build response data
        const responseData = {
          video: {
            id: video.id,
            title: video.title,
            description: video.description,
            videoPlatform: video.video_platform || 'vimeo',
            vimeoVideoId: video.vimeo_video_id,
            videoUrl: video.video_url,
            thumbnailUrl: video.thumbnail_url,
            durationSeconds: video.duration_minutes ? video.duration_minutes * 60 : null,
            orderIndex: video.order_index,
            progress: progress ? {
              progressSeconds: progress.progress_seconds,
              completed: progress.completed,
              lastWatchedAt: progress.last_watched_at
            } : null
          },
          course: video.courses ? {
            id: video.courses.id,
            title: video.courses.title,
            description: video.courses.description
          } : null,
          nextVideo: nextVideo ? {
            id: nextVideo.id,
            title: nextVideo.title
          } : null
        }

        setVideoData(responseData)
        if (responseData.video.progress?.progressSeconds) {
          setCurrentProgress(responseData.video.progress.progressSeconds)
        }
        
      } catch (err) {
        console.error('🚨 Video fetch error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred loading the video')
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if user is authenticated
    if (!authLoading && user) {
      fetchVideoData()
    } else if (!authLoading && !user) {
      setError('Please log in to access training videos')
      setIsLoading(false)
    }
  }, [videoId, user, authLoading])

  const handleBackToCourse = () => {
    if (videoData?.course?.id) {
      router.push(`/training/course/${videoData.course.id}`)
    } else {
      router.push('/training')
    }
  }

  const handleNextLesson = () => {
    if (videoData?.nextVideo?.id) {
      router.push(`/training/video/${videoData.nextVideo.id}`)
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
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
              <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Video</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!videoData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-600">No video data available</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const renderVideo = () => {
    if (!videoData?.video) return (
      <div className="w-full aspect-video rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Loading video...</p>
      </div>
    )
    
    const { video } = videoData
    
    // Use the unified VideoPlayer component for all video types
    if (video.videoPlatform && (video.videoUrl || video.vimeoVideoId)) {
      // For Vimeo videos, construct the URL from the ID if needed
      let videoUrl = video.videoUrl
      if (video.videoPlatform === 'vimeo' && video.vimeoVideoId && !videoUrl) {
        videoUrl = `https://vimeo.com/${video.vimeoVideoId}`
      }
      
      return (
        <VideoPlayer
          videoId={video.id}
          url={videoUrl}
          platform={video.videoPlatform as VideoPlatform}
          initialProgress={currentProgress}
          autoSave={true}
          onProgress={(seconds) => {
            setCurrentProgress(seconds)
          }}
          onEnd={() => {
            console.log('Video completed')
          }}
        />
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
                    <span>
                      {videoData?.video?.durationSeconds 
                        ? `${Math.floor(videoData.video.durationSeconds / 60)} minutes`
                        : 'Duration loading...'
                      }
                    </span>
                  </div>
                  {videoData?.video?.progress?.completed && (
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
            
            {videoData?.nextVideo && (
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

export default function VideoPage() {
  return (
    <Suspense fallback={
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
    }>
      <VideoPageContent />
    </Suspense>
  )
} 