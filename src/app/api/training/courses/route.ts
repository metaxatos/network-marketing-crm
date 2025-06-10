import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'
import type { CourseListResponse } from '@/types/api'

// GET /api/training/courses - Get courses with progress
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    console.log('Training courses API - Starting request for user:', userId)
    const supabase = await createClient()
    
    // Get member's company ID - handle case where member doesn't exist yet
    let member = null
    try {
      member = await getCurrentMember(userId)
      console.log('Training courses API - Member data:', { 
        memberId: member?.id, 
        companyId: member?.company_id,
        hasCompany: !!member?.company_id 
      })
    } catch (error) {
      console.warn('Training courses API - Member not found, returning general courses only:', error)
      // Continue with null member - will return general courses
    }
    
    // If no company, try to get general courses (company_id is null) or return empty
    let courses = null
    let error = null

    if (member?.company_id) {
      console.log('Training courses API - Querying courses for company:', member.company_id)
      const result = await supabase
        .from('training_courses')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          duration_minutes,
          order_index,
          is_required,
          member_course_progress (
            completion_percentage,
            last_video_id,
            last_position_seconds,
            completed_at
          )
        `)
        .eq('company_id', member.company_id)
        .eq('member_course_progress.member_id', userId)
        .order('order_index', { ascending: true })
      
      courses = result.data
      error = result.error
    } else {
      console.log('Training courses API - No company found, querying general courses')
      const result = await supabase
        .from('training_courses')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          duration_minutes,
          order_index,
          is_required,
          member_course_progress (
            completion_percentage,
            last_video_id,
            last_position_seconds,
            completed_at
          )
        `)
        .is('company_id', null)
        .eq('member_course_progress.member_id', userId)
        .order('order_index', { ascending: true })
      
      courses = result.data
      error = result.error
    }

    if (error) {
      console.error('Training courses API - Database error:', error)
      throw error
    }

    console.log('Training courses API - Query successful, found courses:', courses?.length || 0)

    // Find recommended next course
    let recommendedNext: string | undefined
    const incompleteCourses = courses?.filter(
      course => !course.member_course_progress?.[0]?.completed_at
    ) || []

    if (incompleteCourses.length > 0) {
      // Prioritize required courses
      const requiredIncomplete = incompleteCourses.find(c => c.is_required)
      recommendedNext = requiredIncomplete?.id || incompleteCourses[0].id
    }

    const response: CourseListResponse = {
      courses: courses?.map(course => ({
        id: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnail_url,
        durationMinutes: course.duration_minutes,
        progress: course.member_course_progress?.[0] ? {
          percentage: course.member_course_progress[0].completion_percentage,
          lastVideoId: course.member_course_progress[0].last_video_id,
          lastPosition: course.member_course_progress[0].last_position_seconds,
        } : undefined,
      })) || [],
      recommendedNext,
    }

    return apiResponse(response, 200)
  } catch (error) {
    console.error('Get courses error:', error)
    return apiError('Failed to retrieve courses', 500)
  }
}) 