import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getPaginationParams } from '@/lib/api-helpers'

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    const { page = 1, limit = 20 } = getPaginationParams(req.nextUrl.searchParams)
    const offset = (page - 1) * limit

    // Get total count
    const { count: totalCount } = await supabase
      .from('member_activities')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)

    // Get paginated activities
    const { data: activities, error } = await supabase
      .from('member_activities')
      .select('*')
      .eq('member_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    const formattedActivities = activities?.map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      description: getActivityDescription(activity),
      timestamp: activity.created_at,
      metadata: activity.metadata,
    })) || []

    return apiResponse({
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        hasMore: offset + limit < (totalCount || 0),
      },
    }, 200)
  } catch (error) {
    console.error('Activities error:', error)
    return apiError('Failed to retrieve activities', 500)
  }
})

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    const body = await req.json()

    const { activity_type, metadata = {} } = body

    if (!activity_type) {
      return apiError('Activity type is required', 400)
    }

    // Insert the activity
    const { data: activity, error } = await supabase
      .from('member_activities')
      .insert({
        member_id: userId,
        activity_type,
        metadata
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return apiResponse({
      activity: {
        id: activity.id,
        type: activity.activity_type,
        description: getActivityDescription(activity),
        timestamp: activity.created_at,
        metadata: activity.metadata,
      }
    }, 201)
  } catch (error) {
    console.error('Create activity error:', error)
    return apiError('Failed to create activity', 500)
  }
})

function getActivityDescription(activity: any): string {
  switch (activity.activity_type) {
    case 'contact_added':
      return `Added new contact${activity.metadata?.contact_name ? `: ${activity.metadata.contact_name}` : ''}`
    case 'email_sent':
      return `Sent email${activity.metadata?.contact_name ? ` to ${activity.metadata.contact_name}` : ''}`
    case 'training_completed':
      return `Completed training${activity.metadata?.course_title ? `: ${activity.metadata.course_title}` : ''}`
    case 'goal_achieved':
      return `Achieved goal${activity.metadata?.goal_name ? `: ${activity.metadata.goal_name}` : ''}`
    case 'milestone_reached':
      return `Reached milestone${activity.metadata?.milestone_name ? `: ${activity.metadata.milestone_name}` : ''}`
    case 'login':
      return 'Logged in'
    case 'logout':
      return 'Logged out'
    case 'signup':
      return 'Created account'
    default:
      return activity.activity_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  }
} 