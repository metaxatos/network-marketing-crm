import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'
import type { CourseListResponse } from '@/types/api'

// GET /api/training/courses - Get courses with progress
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Get member's company ID
    const member = await getCurrentMember(userId)
    
    if (!member?.company_id) {
      return apiError('Company not found', 404)
    }

    // Get all courses for the company with user's progress
    const { data: courses, error } = await supabase
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

    if (error) {
      throw error
    }

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