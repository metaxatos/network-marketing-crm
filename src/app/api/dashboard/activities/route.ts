import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getPaginationParams } from '@/lib/api-helpers'

// Define the database activity type
interface DatabaseActivity {
  id: string
  member_id: string
  activity_type: string
  metadata?: Record<string, any>
  created_at: string
}

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const { page = 1, limit = 20 } = getPaginationParams(req.nextUrl.searchParams)
    const supabase = await createClient()
    
    // Fetch real activities from member_activities table
    const { data: activities, error, count } = await supabase
      .from('member_activities')
      .select('*', { count: 'exact' })
      .eq('member_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching activities:', error)
      // Return empty activities if table doesn't exist or other error
      return apiResponse({
        activities: [],
        pagination: {
          page,
          limit,
          total: 0,
          hasMore: false,
        },
      }, 200)
    }

    // Transform activities to expected format
    const transformedActivities = activities?.map((activity: DatabaseActivity) => ({
      id: activity.id,
      type: activity.activity_type,
      description: getActivityDescription(activity),
      timestamp: activity.created_at,
      metadata: activity.metadata || {},
    })) || []

    return apiResponse({
      activities: transformedActivities,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > page * limit,
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

    // Insert new activity into database
    const { data: activity, error } = await supabase
      .from('member_activities')
      .insert({
        member_id: userId,
        activity_type,
        metadata,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      return apiError('Failed to create activity', 500)
    }

    // Transform to expected format
    const transformedActivity = {
      id: activity.id,
      type: activity.activity_type,
      description: getActivityDescription(activity),
      timestamp: activity.created_at,
      metadata: activity.metadata || {},
    }

    return apiResponse({
      activity: transformedActivity
    }, 201)
  } catch (error) {
    console.error('Create activity error:', error)
    return apiError('Failed to create activity', 500)
  }
})

function getActivityDescription(activity: DatabaseActivity): string {
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