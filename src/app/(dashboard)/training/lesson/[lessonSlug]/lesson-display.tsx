'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, SkipForward } from 'lucide-react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { VideoPlayer } from '@/components/training/video-player'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { VideoPlatform } from '@/types/training'

export interface LessonDisplayProps {
  video: {
    id: string
    title: string
    description?: string
    video_url: string
    video_platform: VideoPlatform
    thumbnail_url?: string
    duration_seconds?: number
    lesson_order: number
    course_id: string
    slug: string
    course: {
      id: string
      title: string
      description?: string
    }
  }
  navigation: {
    nextLesson: { id: string; title: string; slug: string } | null
    previousLesson: { id: string; title: string; slug: string } | null
    allLessons: Array<{
      id: string
      title: string
      lesson_order: number
      slug: string
    }>
  }
}

export function LessonDisplay({ video, navigation }: LessonDisplayProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [progress, setProgress] = useState<any>(null)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)

  // Fetch user progress on client side (user-specific data)
  useEffect(() => {
    async function fetchProgress() {
      if (!user || authLoading) return
      
      try {
        setIsLoadingProgress(true)
        const supabase = createClient()
        
        const { data: progressData } = await supabase
          .from('member_progress')
          .select('*')
          .eq('member_id', user.id)
          .eq('video_id', video.id)
          .maybeSingle()
        
        setProgress(progressData)
      } catch (error) {
        console.error('Progress fetch error:', error)
      } finally {
        setIsLoadingProgress(false)
      }
    }

    fetchProgress()
  }, [user, video.id, authLoading])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleBackToCourse = () => {
    router.push('/training')
  }

  const handleNextLesson = () => {
    if (navigation.nextLesson) {
      router.push(`/training/lesson/${navigation.nextLesson.slug}`)
    }
  }

  const handlePreviousLesson = () => {
    if (navigation.previousLesson) {
      router.push(`/training/lesson/${navigation.previousLesson.slug}`)
    }
  }

  const renderVideo = () => {
    if (!video.video_url) {
      return (
        <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Video content coming soon</p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl aspect-video">
        <VideoPlayer
          url={video.video_url}
          platform={video.video_platform}
          videoId={video.id}
          initialProgress={progress?.progress_seconds || 0}
          autoSave={true}
        />
      </div>
    )
  }

  if (authLoading || isLoadingProgress) {
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

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToCourse}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Course</span>
            </button>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">{video.course.title}</p>
              <p className="text-xs text-gray-500">Lesson {video.lesson_order}</p>
            </div>
          </div>

          {/* Video Player */}
          <div className="mb-8">
            {renderVideo()}
          </div>

          {/* Lesson Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {video.title}
                </h1>
                
                {progress?.completed && (
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
                
                {video.duration_seconds && (
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {Math.ceil(video.duration_seconds / 60)} minutes
                    </span>
                  </div>
                )}
              </div>
            </div>

            {video.description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {video.description}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow-lg p-6">
            <div className="flex-1">
              {navigation.previousLesson && (
                <button
                  onClick={handlePreviousLesson}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Previous</p>
                    <p className="font-medium">{navigation.previousLesson.title}</p>
                  </div>
                </button>
              )}
            </div>

            <div className="flex-1 text-right">
              {navigation.nextLesson && (
                <button
                  onClick={handleNextLesson}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors ml-auto"
                >
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Next</p>
                    <p className="font-medium">{navigation.nextLesson.title}</p>
                  </div>
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Course Progress */}
          {navigation.allLessons.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
              <div className="space-y-2">
                {navigation.allLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/training/lesson/${lesson.slug}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      lesson.id === video.id
                        ? 'bg-indigo-50 border-2 border-indigo-200'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          {lesson.lesson_order}
                        </span>
                        <span className={`font-medium ${
                          lesson.id === video.id ? 'text-indigo-700' : 'text-gray-700'
                        }`}>
                          {lesson.title}
                        </span>
                      </div>
                      {lesson.id === video.id && (
                        <Play className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}