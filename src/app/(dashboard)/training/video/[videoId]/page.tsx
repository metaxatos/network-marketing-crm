'use client';

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen } from 'lucide-react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.videoId as string
  
  const [videoData, setVideoData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/training/${videoId}`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch video data')
        }
        
        const result = await response.json()
        if (result.success && result.data) {
          setVideoData(result.data)
        } else {
          throw new Error(result.error || 'Failed to load video')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    if (videoId) {
      fetchVideoData()
    }
  }, [videoId])

  const handleBackToCourse = () => {
    router.back()
  }

  if (isLoading) {
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Not Found</h3>
          <p className="text-gray-600 mb-4">
            {error || 'The requested video could not be found.'}
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

  const { video } = videoData

  const renderVideo = () => {
    if (video.videoPlatform === 'youtube') {
      const videoIdMatch = video.videoUrl.includes('youtube.com') 
        ? video.videoUrl.split('v=')[1]?.split('&')[0]
        : video.videoUrl.split('youtu.be/')[1]?.split('?')[0]
      
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoIdMatch}?autoplay=0&rel=0`}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      )
    } else if (video.videoPlatform === 'vimeo') {
      const videoIdMatch = video.videoUrl.split('vimeo.com/')[1]?.split('?')[0]
      
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoIdMatch}?autoplay=0`}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
        />
      )
    } else {
      return (
        <video
          src={video.videoUrl}
          controls
          className="w-full h-full"
          poster={video.thumbnailUrl}
        />
      )
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={handleBackToCourse}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>

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
              {video.durationSeconds && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.ceil(video.durationSeconds / 60)} minutes</span>
                </div>
              )}
              {video.category && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{video.category}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {video.progress && video.durationSeconds && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>
                    {Math.round((video.progress.progressSeconds / video.durationSeconds) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(video.progress.progressSeconds / video.durationSeconds) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 