import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody } from '@/lib/api-helpers'

// Define progress update request for EXISTING lesson structure
interface UpdateProgressRequest {
  lessonId: string
  progressSeconds: number
  completed?: boolean
}

// GET /api/training/progress - Get user's training progress using EXISTING tables
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Get all lesson progress for the user using our EXISTING lesson_progress table
    const { data: progressData, error } = await supabase
      .from('lesson_progress')
      .select(`
        *,
        lesson:course_lessons (
          id,
          title,
          description,
          duration_seconds,
          course_module:course_modules (
            title,
            training_course:training_courses (
              title
            )
          )
        )
      `)
      .eq('member_id', userId)

    if (error) {
      throw error
    }

    // Calculate overall progress from individual lesson progress
    const totalLessons = progressData?.length || 0
    const completedLessons = progressData?.filter((p: any) => p.completed).length || 0
    const totalProgressSeconds = progressData?.reduce((sum: number, p: any) => sum + p.progress_seconds, 0) || 0
    
    return apiResponse({
      progress: {
        lessonsCompleted: completedLessons,
        totalLessons,
        overallCompletion: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) / 100 : 0,
        totalWatchTimeSeconds: totalProgressSeconds,
      },
      lessonProgress: progressData?.map((p: any) => ({
        lessonId: p.lesson_id,
        progressSeconds: p.progress_seconds,
        completed: p.completed,
        lastWatchedAt: p.last_watched_at,
        lessonTitle: p.lesson?.title,
        moduleTitle: p.lesson?.course_module?.title,
        courseTitle: p.lesson?.course_module?.training_course?.title,
      })) || [],
    }, 200)
  } catch (error) {
    console.error('Get progress error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to get progress',
      500
    )
  }
})

// POST /api/training/progress - Update lesson progress using EXISTING tables
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Validate request body
    const body = await validateBody<UpdateProgressRequest>(req, (data) => {
      if (!data.lessonId || typeof data.progressSeconds !== 'number') {
        throw new Error('Lesson ID and progress seconds are required')
      }

      return {
        lessonId: data.lessonId,
        progressSeconds: Math.max(0, data.progressSeconds),
        completed: data.completed || false,
      }
    })

    // Get lesson details to verify it exists using our EXISTING course_lessons table
    const { data: lesson } = await supabase
      .from('course_lessons')
      .select(`
        id,
        title,
        duration_seconds,
        course_module:course_modules (
          title,
          training_course:training_courses (
            title
          )
        )
      `)
      .eq('id', body.lessonId)
      .single()

    if (!lesson) {
      return apiError('Lesson not found', 404)
    }

    // Check for existing progress record in our EXISTING lesson_progress table
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('member_id', userId)
      .eq('lesson_id', body.lessonId)
      .single()

    let progressData
    
    if (existingProgress) {
      // Update existing progress
      const { data: updatedProgress, error } = await supabase
        .from('lesson_progress')
        .update({
          progress_seconds: body.progressSeconds,
          completed: body.completed,
          last_watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('member_id', userId)
        .eq('lesson_id', body.lessonId)
        .select()
        .single()

      if (error) {
        throw error
      }
      progressData = updatedProgress
    } else {
      // Create new progress record
      const { data: newProgress, error } = await supabase
        .from('lesson_progress')
        .insert({
          member_id: userId,
          lesson_id: body.lessonId,
          progress_seconds: body.progressSeconds,
          completed: body.completed,
          last_watched_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }
      progressData = newProgress
    }

    // Log activity if lesson was just completed using our EXISTING member_activities table
    if (body.completed && (!existingProgress || !existingProgress.completed)) {
      try {
        await supabase.from('member_activities').insert({
          member_id: userId,
          activity_type: 'training_completed',
          metadata: {
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            module_title: lesson.course_module?.title,
            course_title: lesson.course_module?.training_course?.title,
          },
        })
      } catch (logError) {
        console.warn('Failed to log training completion:', logError)
        // Don't fail the request if logging fails
      }
    }

    return apiResponse({
      progress: {
        lessonId: progressData.lesson_id,
        progressSeconds: progressData.progress_seconds,
        completed: progressData.completed,
        lastWatchedAt: progressData.last_watched_at,
      },
    }, 200)
  } catch (error) {
    console.error('Update progress error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to update progress',
      400
    )
  }
})
