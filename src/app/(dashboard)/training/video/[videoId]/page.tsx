'use client';

import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, SkipForward } from 'lucide-react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { useAuth } from '@/hooks'

function VideoPageContent() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const videoId = params.videoId as string
  const videoRef = useRef<HTMLVideoElement>(null)
  const vimeoPlayerRef = useRef<HTMLIFrameElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const vimeoProgressInterval = useRef<NodeJS.Timeout | null>(null)
  
  const [videoData, setVideoData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [vimeoCurrentTime, setVimeoCurrentTime] = useState(0)
  const [vimeoDuration, setVimeoDuration] = useState(0)
  const [isBrowser, setIsBrowser] = useState(false)

  // Check if we're in the browser
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined')
  }, [])

  // Vimeo Player API helper functions
  const postMessageToVimeo = (method: string, value?: any) => {
    if (!isBrowser || !vimeoPlayerRef.current) return
    
    const data: { method: string; value?: any } = { method }
    if (value !== undefined) data.value = value
    
    const message = JSON.stringify(data)
    vimeoPlayerRef.current.contentWindow?.postMessage(message, '*')
  }

  const handleVimeoMessage = (event: MessageEvent) => {
    if (!isBrowser || !vimeoPlayerRef.current) return
    
    // Only accept messages from Vimeo
    if (!event.origin.includes('vimeo.com')) return
    
    try {
      const data = JSON.parse(event.data)
      
      switch (data.event) {
        case 'ready':
          console.log('🎬 Vimeo player ready')
          setIsVideoReady(true)
          // Listen for timeupdate events
          postMessageToVimeo('addEventListener', 'timeupdate')
          postMessageToVimeo('addEventListener', 'loadedmetadata')
          postMessageToVimeo('addEventListener', 'ended')
          // Set current time if resuming
          if (currentProgress > 0) {
            setTimeout(() => {
              postMessageToVimeo('setCurrentTime', currentProgress)
            }, 1000)
          }
          break
          
        case 'timeupdate':
          if (data.data && typeof data.data.seconds === 'number') {
            setVimeoCurrentTime(data.data.seconds)
            if (data.data.duration) {
              setVimeoDuration(data.data.duration)
            }
          }
          break
          
        case 'loadedmetadata':
          if (data.data && data.data.duration) {
            setVimeoDuration(data.data.duration)
          }
          break
          
        case 'ended':
          // Mark video as completed when it ends
          updateVideoProgress(vimeoDuration, true)
          break
      }
    } catch (err) {
      console.error('Error parsing Vimeo message:', err)
    }
  }

  // Set up Vimeo message listener only in browser
  useEffect(() => {
    if (!isBrowser) return
    
    const messageHandler = (event: MessageEvent) => handleVimeoMessage(event)
    window.addEventListener('message', messageHandler)
    
    return () => {
      window.removeEventListener('message', messageHandler)
    }
  }, [currentProgress, vimeoDuration, isBrowser])

  // Fetch video data with better error handling
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId || !user || !isBrowser) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/training/${videoId}`, {
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
        
        if (result.success && result.data) {
          setVideoData(result.data)
          if (result.data.video.progress?.progressSeconds) {
            setCurrentProgress(result.data.video.progress.progressSeconds)
          }
        } else {
          throw new Error(result.message || 'Failed to load video')
        }
      } catch (err) {
        console.error('🚨 Video fetch error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred loading the video')
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if user is authenticated and we're in browser
    if (!authLoading && user && isBrowser) {
      fetchVideoData()
    } else if (!authLoading && !user && isBrowser) {
      setError('Please log in to access training videos')
      setIsLoading(false)
    }
  }, [videoId, user, authLoading, isBrowser])

  // Progress tracking for Vimeo videos
  useEffect(() => {
    if (!isBrowser || !videoData || videoData.video.videoPlatform !== 'vimeo' || !isVideoReady) return

    // Update progress every 5 seconds for Vimeo videos
    vimeoProgressInterval.current = setInterval(() => {
      if (vimeoCurrentTime > 0) {
        updateVideoProgress(vimeoCurrentTime)
      }
    }, 5000)

    return () => {
      if (vimeoProgressInterval.current) {
        clearInterval(vimeoProgressInterval.current)
      }
    }
  }, [videoData, isVideoReady, vimeoCurrentTime, isBrowser])

  // Set up video progress tracking for HTML5 videos
  useEffect(() => {
    if (!isBrowser || !videoRef.current || !videoData || !isVideoReady) return
    if (videoData.video.videoPlatform === 'vimeo') return // Skip for Vimeo

    const video = videoRef.current
    
    // Resume from last position
    if (currentProgress > 0) {
      video.currentTime = currentProgress
    }

    const updateProgress = async () => {
      if (!video || !videoData) return
      
      const progressSeconds = Math.floor(video.currentTime)
      const duration = video.duration
      const completed = duration > 0 && (progressSeconds / duration) >= 0.9 // 90% completion
      
      await updateVideoProgress(progressSeconds, completed)
    }

    // Update progress every 5 seconds
    progressIntervalRef.current = setInterval(updateProgress, 5000)

    // Update progress when video ends
    const handleVideoEnd = () => {
      updateProgress()
    }

    video.addEventListener('ended', handleVideoEnd)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      video.removeEventListener('ended', handleVideoEnd)
    }
  }, [videoData, isVideoReady, currentProgress, isBrowser])

  const updateVideoProgress = async (progressSeconds: number, completed?: boolean) => {
    if (!videoData || !isBrowser) return

    try {
      const progressData = {
        videoId: videoData.video.id,
        progressSeconds: Math.floor(progressSeconds),
        completed: completed || false
      }

      const response = await fetch('/api/training/video-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progressData)
      })

      if (!response.ok) {
        throw new Error('Failed to update progress')
      }

      const result = await response.json()
      
      if (result.success && completed) {
        // Show celebration when video is completed
        console.log('🎉 Video completed!')
        // You could add a celebration animation here
      }
    } catch (err) {
      console.error('Error updating video progress:', err)
    }
  }

  const handleBackToCourse = () => {
    if (!videoData || !isBrowser) return
    router.push(`/training/course/${videoData.course.id}`)
  }

  const handleNextLesson = () => {
    if (!videoData?.nextVideo || !isBrowser) return
    router.push(`/training/video/${videoData.nextVideo.id}`)
  }

  const handleVideoLoadedData = () => {
    setIsVideoReady(true)
  }

  // Show loading until browser check is complete
  if (!isBrowser) {
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
              <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Video</h2>
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
    
    if (video.videoPlatform === 'vimeo' && video.vimeoVideoId) {
      // Build Vimeo embed URL with API parameters
      const vimeoUrl = `https://player.vimeo.com/video/${video.vimeoVideoId}?api=1&player_id=vimeo-player&autopause=0&byline=0&portrait=0&title=0`
      
      return (
        <iframe
          ref={vimeoPlayerRef}
          id="vimeo-player"
          src={vimeoUrl}
          className="w-full aspect-video rounded-lg shadow-lg"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={video.title}
        />
      )
    }
    
    if (video.videoUrl) {
      return (
        <video
          ref={videoRef}
          className="w-full aspect-video rounded-lg shadow-lg"
          controls
          onLoadedData={handleVideoLoadedData}
          poster={video.thumbnailUrl || undefined}
        >
          <source src={video.videoUrl} type="video/mp4" />
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

  const getCurrentProgressSeconds = () => {
    if (videoData?.video.videoPlatform === 'vimeo') {
      return vimeoCurrentTime
    }
    return videoRef.current?.currentTime || 0
  }

  const getCurrentDuration = () => {
    if (videoData?.video.videoPlatform === 'vimeo') {
      return vimeoDuration
    }
    return videoRef.current?.duration || 0
  }

  const progressPercentage = getCurrentDuration() > 0 
    ? Math.min((getCurrentProgressSeconds() / getCurrentDuration()) * 100, 100)
    : 0

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
                {videoData.video.title}
              </h1>
              <p className="text-sm text-gray-600">
                Course: {videoData.course.title}
              </p>
            </div>
          </div>

          {/* Video Player */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6">
              {renderVideo()}
              
              {/* Progress Bar */}
              {getCurrentDuration() > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress: {Math.round(progressPercentage)}%</span>
                    <span>
                      {Math.floor(getCurrentProgressSeconds() / 60)}:
                      {String(Math.floor(getCurrentProgressSeconds() % 60)).padStart(2, '0')} / 
                      {Math.floor(getCurrentDuration() / 60)}:
                      {String(Math.floor(getCurrentDuration() % 60)).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
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
                  {videoData.video.title}
                </h2>
                {videoData.video.description && (
                  <p className="text-gray-600 mb-4">
                    {videoData.video.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(getCurrentDuration() / 60)} minutes</span>
                  </div>
                  {progressPercentage >= 90 && (
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
            
            {videoData.nextVideo && (
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