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

  // Vimeo Player API helper functions
  const postMessageToVimeo = (method: string, value?: any) => {
    if (!vimeoPlayerRef.current) return
    
    const data: { method: string; value?: any } = { method }
    if (value !== undefined) data.value = value
    
    const message = JSON.stringify(data)
    vimeoPlayerRef.current.contentWindow?.postMessage(message, '*')
  }

  const handleVimeoMessage = (event: MessageEvent) => {
    if (!vimeoPlayerRef.current) return
    
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

  // Set up Vimeo message listener
  useEffect(() => {
    window.addEventListener('message', handleVimeoMessage)
    return () => {
      window.removeEventListener('message', handleVimeoMessage)
    }
  }, [currentProgress, vimeoDuration])

  // Fetch video data with better error handling
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId || !user) return
      
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

    // Only fetch if user is authenticated
    if (!authLoading && user) {
      fetchVideoData()
    } else if (!authLoading && !user) {
      setError('Please log in to access training videos')
      setIsLoading(false)
    }
  }, [videoId, user, authLoading])

  // Progress tracking for Vimeo videos
  useEffect(() => {
    if (!videoData || videoData.video.videoPlatform !== 'vimeo' || !isVideoReady) return

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
  }, [videoData, isVideoReady, vimeoCurrentTime])

  // Set up video progress tracking for HTML5 videos
  useEffect(() => {
    if (!videoRef.current || !videoData || !isVideoReady) return
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
  }, [videoData, isVideoReady, currentProgress])

  const updateVideoProgress = async (progressSeconds: number, completed?: boolean) => {
    if (!videoData) return
    
    const duration = videoData.video.videoPlatform === 'vimeo' 
      ? vimeoDuration 
      : videoRef.current?.duration || videoData.video.durationSeconds
    
    const isCompleted = completed !== undefined 
      ? completed 
      : duration > 0 && (progressSeconds / duration) >= 0.9

    try {
      const response = await fetch('/api/training/video-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          videoId: videoData.video.id,
          progressSeconds: Math.floor(progressSeconds),
          completed: isCompleted
        })
      })

      if (response.ok) {
        setCurrentProgress(Math.floor(progressSeconds))
        
        // Update video data if completed
        if (isCompleted && !videoData.video.progress?.completed) {
          setVideoData((prev: any) => ({
            ...prev,
            video: {
              ...prev.video,
              progress: {
                ...prev.video.progress,
                completed: true,
                progressSeconds: Math.floor(progressSeconds)
              }
            }
          }))
        }
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const handleBackToCourse = () => {
    router.back()
  }

  const handleNextLesson = () => {
    if (videoData?.nextRecommended) {
      router.push(`/training/video/${videoData.nextRecommended.id}`)
    }
  }

  const handleVideoLoadedData = () => {
    setIsVideoReady(true)
  }

  // Show loading while auth is checking or video is loading
  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
          
          <div className="bg-gray-200 aspect-video rounded-lg animate-pulse" />
          
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !videoData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Not Available</h3>
          <p className="text-gray-600 mb-4">
            {error || 'The requested video could not be loaded.'}
          </p>
          <button 
            onClick={handleBackToCourse}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Course
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const { video, nextRecommended } = videoData

  const renderVideo = () => {
    if (video.videoPlatform === 'youtube') {
      const videoIdMatch = video.videoUrl.includes('youtube.com') 
        ? video.videoUrl.split('v=')[1]?.split('&')[0]
        : video.videoUrl.split('youtu.be/')[1]?.split('?')[0]
      
      const startTime = currentProgress > 0 ? `&start=${Math.floor(currentProgress)}` : ''
      
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoIdMatch}?autoplay=0&rel=0${startTime}`}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      )
    } else if (video.videoPlatform === 'vimeo') {
      const videoIdMatch = video.videoUrl.split('vimeo.com/')[1]?.split('?')[0]
      
      return (
        <iframe
          ref={vimeoPlayerRef}
          src={`https://player.vimeo.com/video/${videoIdMatch}?api=1&player_id=vimeo_${video.id}`}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          id={`vimeo_${video.id}`}
        />
      )
    } else {
      return (
        <video
          ref={videoRef}
          src={video.videoUrl}
          controls
          className="w-full h-full"
          poster={video.thumbnailUrl}
          onLoadedData={handleVideoLoadedData}
        />
      )
    }
  }

  const getCurrentProgressSeconds = () => {
    if (video.videoPlatform === 'vimeo') {
      return Math.floor(vimeoCurrentTime)
    }
    return currentProgress
  }

  const getCurrentDuration = () => {
    if (video.videoPlatform === 'vimeo') {
      return vimeoDuration
    }
    return video.durationSeconds
  }

  const progressPercentage = getCurrentDuration() > 0 
    ? Math.round((getCurrentProgressSeconds() / getCurrentDuration()) * 100)
    : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBackToCourse}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </button>
          
          {nextRecommended && (
            <button
              onClick={handleNextLesson}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>Next Lesson</span>
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Video Player */}
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          {renderVideo()}
        </div>

        {/* Video Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
              {video.progress?.completed && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              )}
            </div>
            
            {video.description && (
              <p className="text-gray-600 leading-relaxed">{video.description}</p>
            )}
            
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              {getCurrentDuration() && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.ceil(getCurrentDuration() / 60)} minutes</span>
                </div>
              )}
              {video.category && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{video.category}</span>
                </div>
              )}
              {video.videoPlatform && (
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  <span className="capitalize">{video.videoPlatform}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {getCurrentDuration() && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{Math.floor(getCurrentProgressSeconds() / 60)}:{(getCurrentProgressSeconds() % 60).toString().padStart(2, '0')}</span>
                  <span>{Math.floor(getCurrentDuration() / 60)}:{(Math.floor(getCurrentDuration()) % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Next Lesson Card */}
          {nextRecommended && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Lesson</h3>
              <p className="text-gray-600 mb-4">{nextRecommended.title}</p>
              <button
                onClick={handleNextLesson}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Continue Learning
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function VideoPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading video...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <VideoPageContent />
    </Suspense>
  )
} 