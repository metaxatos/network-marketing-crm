import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody, getCurrentMember } from '@/lib/api-helpers'
import type { EnrollCourseRequest } from '@/types/api'

// POST /api/training/enroll - Enroll in course
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Validate request body
    const body = await validateBody<EnrollCourseRequest>(req, (data) => {
      if (!data.courseId) {
        throw new Error('Course ID is required')
      }

      return {
        courseId: data.courseId,
      }
    })

    // Get member's company ID
    const member = await getCurrentMember(userId)
    
    if (!member?.company_id) {
      return apiError('Company not found', 404)
    }

    // Verify course exists and belongs to company
    const { data: course } = await supabase
      .from('training_courses')
      .select('id, title, company_id')
      .eq('id', body.courseId)
      .eq('company_id', member.company_id)
      .single()

    if (!course) {
      return apiError('Course not found', 404)
    }

    // Check if already enrolled
    const { data: existingProgress } = await supabase
      .from('member_course_progress')
      .select('member_id')
      .eq('member_id', userId)
      .eq('course_id', body.courseId)
      .single()

    if (existingProgress) {
      return apiError('Already enrolled in this course', 400)
    }

    // Create enrollment record
    const { data: enrollment, error } = await supabase
      .from('member_course_progress')
      .insert({
        member_id: userId,
        course_id: body.courseId,
        completion_percentage: 0,
        last_position_seconds: 0,
        completed_videos: [],
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log activity
    await supabase.from('member_activities').insert({
      member_id: userId,
      activity_type: 'course_enrolled',
      metadata: {
        course_id: body.courseId,
        course_title: course.title,
      },
    })

    return apiResponse({
      enrollment: {
        courseId: enrollment.course_id,
        enrolledAt: enrollment.updated_at,
      },
    }, 201, 'Successfully enrolled in course')
  } catch (error) {
    console.error('Course enrollment error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to enroll in course',
      400
    )
  }
}) 