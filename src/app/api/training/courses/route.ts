import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'
import type { TrainingVideo, MemberProgress } from '@/types/training'

// Define the simplified database video type with progress
interface DatabaseVideoWithProgress {
  id: string
  company_id: string
  title: string
  description?: string
  video_url: string
  video_platform: 'youtube' | 'vimeo' | 'wistia' | 'direct'
  thumbnail_url?: string
  duration_seconds?: number
  category?: string
  order_index: number
  is_published: boolean
  member_progress?: Array<{
    progress_seconds: number
    completed: boolean
    last_watched_at?: string
  }>
}

// GET /api/training/courses - Get all available training videos (replaces courses)
export const GET = withAuth(async (req, userId) => {
  try {
    console.log('Training videos API - Starting request for user:', userId)
    const supabase = await createClient()
    
    // Get member's company ID - handle case where member doesn't exist yet
    let member = null
    try {
      member = await getCurrentMember(userId)
      console.log('Training videos API - Member data:', { 
        memberId: member?.id, 
        companyId: member?.company_id,
        hasCompany: !!member?.company_id 
      })
    } catch (error) {
      console.warn('Training videos API - Member not found, returning general videos only:', error)
      // Continue with null member - will return general videos
    }
    
    // Query training videos with progress (simplified from course/module/lesson structure)
    let videos = null
    let error = null

    if (member?.company_id) {
      console.log('Training videos API - Querying videos for company:', member.company_id)
      const result = await supabase
        .from('training_videos')
        .select(`
          id,
          company_id,
          title,
          description,
          video_url,
          video_platform,
          thumbnail_url,
          duration_seconds,
          category,
          order_index,
          is_published,
          member_progress!inner (
            progress_seconds,
            completed,
            last_watched_at
          )
        `)
        .eq('company_id', member.company_id)
        .eq('is_published', true)
        .eq('member_progress.member_id', userId)
        .order('order_index', { ascending: true })
      
      videos = result.data
      error = result.error
    } else {
      console.log('Training videos API - No company found, querying general videos')
      const result = await supabase
        .from('training_videos')
        .select(`
          id,
          company_id,
          title,
          description,
          video_url,
          video_platform,
          thumbnail_url,
          duration_seconds,
          category,
          order_index,
          is_published,
          member_progress!left (
            progress_seconds,
            completed,
            last_watched_at
          )
        `)
        .is('company_id', null)
        .eq('is_published', true)
        .eq('member_progress.member_id', userId)
        .order('order_index', { ascending: true })
      
      videos = result.data
      error = result.error
    }

    if (error) {
      console.error('Training videos API - Database error:', error)
      throw error
    }

    console.log('Training videos API - Query successful, found videos:', videos?.length || 0)

    // Find recommended next video (first uncompleted video)
    let recommendedNext: string | undefined
    const incompleteVideos = videos?.filter(
      (video: DatabaseVideoWithProgress) => !video.member_progress?.[0]?.completed
    ) || []

    if (incompleteVideos.length > 0) {
      recommendedNext = incompleteVideos[0].id
    }

    // Group videos by category for better organization
    const categorizedVideos = videos?.reduce((acc: any, video: DatabaseVideoWithProgress) => {
      const category = video.category || 'General'
      if (!acc[category]) acc[category] = []
      acc[category].push({
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnail_url,
        durationSeconds: video.duration_seconds,
        category: video.category,
        progress: video.member_progress?.[0] ? {
          progressSeconds: video.member_progress[0].progress_seconds,
          completed: video.member_progress[0].completed,
          lastWatchedAt: video.member_progress[0].last_watched_at,
        } : undefined,
      })
      return acc
    }, {}) || {}

    return apiResponse({
      videos: Object.entries(categorizedVideos).map(([category, categoryVideos]) => ({
        category,
        videos: categoryVideos,
      })),
      recommendedNext,
      totalVideos: videos?.length || 0,
    }, 200)
  } catch (error) {
    console.error('Get training videos error:', error)
    return apiError('Failed to retrieve training videos', 500)
  }
}) 