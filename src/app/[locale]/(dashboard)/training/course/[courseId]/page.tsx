'use client';

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTrainingCourses } from '@/hooks'
import { 
  Play, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  ArrowLeft, 
  Users, 
  Trophy,
  PlayCircle,
  Lock,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  
  const { data: coursesData, isLoading, error } = useTrainingCourses()
  
  // Find the specific course
  const course = coursesData?.courses?.find((c: any) => c.id === courseId)
  
  const handleVideoClick = (video: any) => {
    // Use the slug from database, fallback to generated slug if needed
    const lessonSlug = video.slug || video.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    // Navigate to lesson page using slug
    router.push(`/training/lesson/${lessonSlug}`)
  }

  const handleBackToCourses = () => {
    router.push('/training')
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-4" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse mb-4" />
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Not Found</h3>
          <p className="text-gray-600 mb-4">
            {error ? 'There was an error loading the course.' : 'The requested course could not be found.'}
          </p>
          <button 
            onClick={handleBackToCourses}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const totalVideos = course.modules?.reduce((acc: number, mod: any) => acc + mod.videos.length, 0) || 0
  const completedVideos = course.modules?.reduce((acc: number, mod: any) => 
    acc + mod.videos.filter((v: any) => v.progress?.completed).length, 0
  ) || 0
  const overallProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            {/* Back Button */}
            <button 
              onClick={handleBackToCourses}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                {course.description && (
                  <p className="text-gray-600 mb-4">{course.description}</p>
                )}
                
                {/* Course Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{totalVideos} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{course.modules?.length || 0} modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>{completedVideos} completed</span>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="text-center">
                <div className="relative w-16 h-16 mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={overallProgress === 100 ? "#10b981" : "#3b82f6"}
                      strokeWidth="3"
                      strokeDasharray={`${overallProgress}, 100`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700">{overallProgress}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Progress</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Course Modules */}
        <div className="space-y-4">
          {course.modules?.map((module: any, moduleIndex: number) => (
            <ModuleSection
              key={`${module.name}-${module.order}`}
              module={module}
              moduleIndex={moduleIndex}
              onVideoClick={handleVideoClick}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

function ModuleSection({ module, moduleIndex, onVideoClick }: { 
  module: any
  moduleIndex: number
  onVideoClick: (video: any) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const completedVideos = module.videos.filter((v: any) => v.progress?.completed).length
  const totalVideos = module.videos.length
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Module Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span>{completedVideos}/{totalVideos} lessons</span>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={progressPercent === 100 ? "#10b981" : "#3b82f6"}
                strokeWidth="2"
                strokeDasharray={`${progressPercent}, 100`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-6 space-y-3">
            {module.videos.map((video: any, index: number) => (
              <VideoItem
                key={video.id}
                video={video}
                videoIndex={index}
                onVideoClick={onVideoClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VideoItem({ video, videoIndex, onVideoClick }: { 
  video: any
  videoIndex: number
  onVideoClick: (video: any) => void
}) {
  const isCompleted = video.progress?.completed || false
  const progressPercent = video.duration_seconds && video.progress?.progress_seconds 
    ? Math.round((video.progress.progress_seconds / video.duration_seconds) * 100)
    : 0

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className={`group relative bg-white rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer hover:border-blue-300 ${
        isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
      }`}
      onClick={() => onVideoClick(video)}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail or Play Icon */}
          <div className="relative flex-shrink-0">
            {video.thumbnail_url ? (
              <img 
                src={video.thumbnail_url} 
                alt={video.title}
                className="w-16 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-blue-600" />
              </div>
            )}
            
            {/* Progress indicator */}
            {progressPercent > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b">
                <div 
                  className="h-full bg-blue-600 rounded-b transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-medium text-gray-900 group-hover:text-blue-600 transition-colors ${
                  isCompleted ? 'line-through text-green-600' : ''
                }`}>
                  {video.title}
                </h4>
                {video.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {video.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration_seconds)}
                  </div>
                  {video.is_required && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">
                      Required
                    </span>
                  )}
                  {isCompleted && (
                    <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0 ml-4">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Play className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 