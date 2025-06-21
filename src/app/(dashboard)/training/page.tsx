'use client';

import { Suspense, useState, useEffect } from 'react'
import { useTrainingCourses } from '@/hooks'
import { Play, Clock, CheckCircle, Star, Users, BookOpen, Trophy, ArrowRight, GraduationCap } from 'lucide-react'
import CourseCardSkeleton from '@/components/training/CourseCardSkeleton'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Modern Course Card Component
function ModernCourseCard({ course }: { course: any }) {
  const totalVideos = course.modules.reduce((acc: number, mod: any) => acc + mod.videos.length, 0)
  const completedVideos = course.modules.reduce((acc: number, mod: any) => 
    acc + mod.videos.filter((v: any) => v.progress?.completed).length, 0
  )
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
  
  const totalDuration = course.modules.reduce((acc: number, mod: any) => 
    acc + mod.videos.reduce((sum: number, v: any) => sum + (v.duration_seconds || 0), 0), 0
  )
  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)

  const nextVideo = course.modules
    .flatMap((mod: any) => mod.videos)
    .find((video: any) => !video.progress?.completed)

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Hero Section */}
      <div className="relative h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Progress Ring */}
        <div className="absolute top-4 right-4">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray={`${progressPercent}, 100`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-white/80" />
            <span className="text-white/80 text-sm font-medium">Training Course</span>
          </div>
          <h3 className="text-white text-xl font-bold mb-2 group-hover:text-blue-100 transition-colors">
            {course.title}
          </h3>
          <p className="text-white/90 text-sm line-clamp-2">
            {course.description || 'Master the fundamentals and advance your skills'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full mb-2 mx-auto">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{totalVideos}</div>
            <div className="text-xs text-gray-500">Lessons</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-full mb-2 mx-auto">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {hours > 0 ? `${hours}h` : `${minutes}m`}
            </div>
            <div className="text-xs text-gray-500">Duration</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-full mb-2 mx-auto">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{completedVideos}</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href={nextVideo ? `/training/video/${nextVideo.id}` : `/training/course/${course.id}`}
          className="w-full"
        >
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg">
            {progressPercent === 0 ? (
              <>
                <Play className="w-5 h-5" />
                Start Course
              </>
            ) : progressPercent === 100 ? (
              <>
                <Trophy className="w-5 h-5" />
                Review Course
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Continue Learning
              </>
            )}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>
      </div>
    </div>
  )
}

// Loading State
function TrainingLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="text-center space-y-4">
        <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
      </div>
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Main Training Page Component
function TrainingContent() {
  const { data: coursesData, isLoading, error } = useTrainingCourses()
  
  // Debug logging
  useEffect(() => {
    console.log('🎓 Training Page Debug:', {
      isLoading,
      error: error?.message,
      coursesData,
      coursesLength: coursesData?.courses?.length,
      totalLessons: coursesData?.totalLessons,
      completedLessons: coursesData?.completedLessons
    })
  }, [coursesData, isLoading, error])
  
  if (isLoading) {
    return <TrainingLoadingSkeleton />
  }

  if (error) {
    console.error('🚨 Training API Error:', error)
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Courses</h3>
        <p className="text-gray-600 mb-4">There was an error loading your training courses.</p>
        <div className="text-sm text-gray-500 mb-4">
          Error: {error.message}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const courses = coursesData?.courses || []
  const { totalLessons, completedLessons, overallProgress } = coursesData || {}

  console.log('🎓 Rendering Training Page with:', {
    coursesCount: courses.length,
    courses: courses,
    totalLessons,
    completedLessons,
    overallProgress
  })

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Training Academy</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your learning journey starts here. New courses will appear as they become available.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-lg mx-auto">
          <h4 className="font-semibold text-gray-900 mb-2">Coming Soon</h4>
          <p className="text-sm text-gray-600">
            We're preparing exciting training content to help you succeed in your network marketing journey.
          </p>
        </div>
        <div className="mt-8 text-sm text-gray-400">
          Debug: Received {courses.length} courses from API
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Training Academy</h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Master the skills you need to succeed. Track your progress and celebrate your achievements.
        </p>
        
        {/* Overall Progress */}
        {(totalLessons && totalLessons > 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">Your Overall Progress</span>
              <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <ModernCourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}

// Main Page Export
export default function TrainingPage() {
  const [authStatus, setAuthStatus] = useState<{
    user: any
    isLoading: boolean
    error: string | null
  }>({
    user: null,
    isLoading: true,
    error: null
  })

  const router = useRouter()
  const { data: coursesData, isLoading, error, refetch } = useTrainingCourses()
  const courses = coursesData?.courses || []

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        
        console.log('🔐 Client-side auth check:', {
          user: user ? { id: user.id, email: user.email } : null,
          error: error?.message,
          cookies: document.cookie
        })
        
        setAuthStatus({
          user,
          isLoading: false,
          error: error?.message || null
        })
        
        if (!user && !error) {
          console.log('🔐 No user found, redirecting to login')
          router.push('/auth/login?redirect=/training')
        }
      } catch (err) {
        console.error('🔐 Auth check error:', err)
        setAuthStatus({
          user: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }
    
    checkAuth()
  }, [router])

  if (authStatus.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (authStatus.error || !authStatus.user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Authentication Error: {authStatus.error || 'Not logged in'}</p>
            <button 
              onClick={() => router.push('/auth/login?redirect=/training')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Debug info
  const debugInfo = {
    authUser: authStatus.user ? { id: authStatus.user.id, email: authStatus.user.email } : null,
    coursesCount: courses?.length || 0,
    isLoading,
    error: error?.message,
    cookies: typeof document !== 'undefined' ? document.cookie : 'N/A'
  }



  return (
    <DashboardLayout>
      {/* Debug Panel */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">🔍 Debug Info:</h3>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="space-y-8">
        <Suspense fallback={<TrainingLoadingSkeleton />}>
          <TrainingContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
} 