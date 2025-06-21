import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'

// GET /api/training/next-video?currentVideoId=xxx - Get next video in sequence
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createApiClient(req)
    const { searchParams } = new URL(req.url)
    const currentVideoId = searchParams.get('currentVideoId')
    
    if (!currentVideoId) {
      return apiError('Current video ID is required', 400)
    }

    const member = await getCurrentMember(userId)
    if (!member?.company_id) {
      return apiError('Company not found', 404)
    }

    // Get current video to find its course and order
    const { data: currentVideo } = await supabase
      .from('training_videos')
      .select('course_id, order_index, category')
      .eq('id', currentVideoId)
      .single()

    if (!currentVideo) {
      return apiError('Current video not found', 404)
    }

    // Find next video in the same course/category with higher order_index
    const { data: nextVideo } = await supabase
      .from('training_videos')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        duration_seconds,
        order_index
      `)
      .eq('course_id', currentVideo.course_id)
      .or(`company_id.eq.${member.company_id},company_id.is.null`)
      .eq('is_published', true)
      .gt('order_index', currentVideo.order_index)
      .order('order_index', { ascending: true })
      .limit(1)
      .single()

    if (!nextVideo) {
      // No next video in course, try to find next video in same category
      const { data: categoryNextVideo } = await supabase
        .from('training_videos')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          duration_seconds,
          order_index
        `)
        .eq('category', currentVideo.category)
        .or(`company_id.eq.${member.company_id},company_id.is.null`)
        .eq('is_published', true)
        .gt('order_index', currentVideo.order_index)
        .order('order_index', { ascending: true })
        .limit(1)
        .single()

      return apiResponse({
        nextVideo: categoryNextVideo || null
      })
    }

    return apiResponse({
      nextVideo
    })
  } catch (error) {
    console.error('Get next video error:', error)
    return apiError('Failed to get next video', 500)
  }
}) 