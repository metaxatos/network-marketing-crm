import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody, getCurrentMember } from '@/lib/api-helpers'

// Define lesson access request using our EXISTING structure
interface AccessLessonRequest {
  lessonId: string
}

// POST /api/training/enroll - Start watching a lesson (using our EXISTING lesson structure)
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Validate request body
    const body = await validateBody<AccessLessonRequest>(req, (data) => {
      if (!data.lessonId) {
        throw new Error('Lesson ID is required')
      }

      return {
        lessonId: data.lessonId,
      }
    })

    // Verify lesson exists using our EXISTING course_lessons table
    const { data: lesson } = await supabase
      .from('course_lessons')
      .select(`
        id, 
        title, 
        is_published,
        course_module:course_modules (
          title,
          training_course:training_courses (
            title,
            is_published
          )
        )
      `)
      .eq('id', body.lessonId)
      .eq('is_published', true)
      .single()

    if (!lesson || !lesson.course_module?.training_course?.is_published) {
      return apiError('Lesson not found or not available', 404)
    }

    // Check if user already has progress record for this lesson using our EXISTING lesson_progress table
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('member_id, lesson_id, created_at')
      .eq('member_id', userId)
      .eq('lesson_id', body.lessonId)
      .single()

    if (existingProgress) {
      return apiResponse({
        message: 'Lesson access confirmed',
        lesson: {
          id: lesson.id,
          title: lesson.title,
          moduleTitle: lesson.course_module?.title,
          courseTitle: lesson.course_module?.training_course?.title,
          hasExistingProgress: true,
          firstAccessedAt: existingProgress.created_at,
        },
      }, 200)
    }

    // Create initial progress record using our EXISTING lesson_progress table
    const { data: newProgress, error } = await supabase
      .from('lesson_progress')
      .insert({
        member_id: userId,
        lesson_id: body.lessonId,
        progress_seconds: 0,
        completed: false,
        last_watched_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log activity for starting a new lesson using our EXISTING member_activities table
    try {
      await supabase.from('member_activities').insert({
        member_id: userId,
        activity_type: 'training_started',
        metadata: {
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          module_title: lesson.course_module?.title,
          course_title: lesson.course_module?.training_course?.title,
        },
      })
    } catch (logError) {
      console.warn('Failed to log training start:', logError)
      // Don't fail the request if logging fails
    }

    return apiResponse({
      message: 'Lesson access granted',
      lesson: {
        id: lesson.id,
        title: lesson.title,
        moduleTitle: lesson.course_module?.title,
        courseTitle: lesson.course_module?.training_course?.title,
        hasExistingProgress: false,
        firstAccessedAt: newProgress.created_at,
      },
    }, 201)
  } catch (error) {
    console.error('Lesson access error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to access lesson',
      400
    )
  }
})
