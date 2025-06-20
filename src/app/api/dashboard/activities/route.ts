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
    
    // Return mock activities for now since member_activities table doesn't exist
    // This will be replaced with real data once we create the proper table structure
    const mockActivities = [
      {
        id: '1',
        type: 'signup',
        description: 'Created account',
        timestamp: new Date().toISOString(),
        metadata: {},
      },
      {
        id: '2', 
        type: 'login',
        description: 'Logged in',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metadata: {},
      }
    ]

    return apiResponse({
      activities: mockActivities,
      pagination: {
        page,
        limit,
        total: mockActivities.length,
        hasMore: false,
      },
    }, 200)
  } catch (error) {
    console.error('Activities error:', error)
    return apiError('Failed to retrieve activities', 500)
  }
})

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json()
    const { activity_type, metadata = {} } = body

    if (!activity_type) {
      return apiError('Activity type is required', 400)
    }

    // Return mock activity for now since member_activities table doesn't exist
    const mockActivity = {
      id: `mock-${Date.now()}`,
      type: activity_type,
      description: getActivityDescription({
        id: 'mock',
        member_id: userId,
        activity_type,
        metadata,
        created_at: new Date().toISOString()
      }),
      timestamp: new Date().toISOString(),
      metadata,
    }

    return apiResponse({
      activity: mockActivity
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