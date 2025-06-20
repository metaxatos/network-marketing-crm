import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'

// Define simplified types for new schema
interface DashboardMetricsResponse {
  metrics: {
    contactsThisWeek: number
    emailsToday: number
    trainingProgress: number
  }
  recentActivities: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
  quickActions: {
    hasPendingFollowups: boolean
    suggestedTraining?: string
  }
}

interface DatabaseCommunication {
  id: string
  member_id: string
  type: string
  subject: string
  content: string
  metadata?: Record<string, any>
  created_at: string
}

interface VideoProgress {
  completed: boolean
}

// GET /api/dashboard/metrics - Fetch key dashboard metrics (using new schema)
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()

    // Get date ranges
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Get contacts added this week (this table exists)
    const { count: contactsThisWeek } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)
      .gte('created_at', startOfWeek.toISOString())

    // Get training progress - use fallback to avoid errors
    let trainingProgress = 0
    try {
      const { data: lessonProgress } = await supabase
        .from('lesson_progress')
        .select('completed')
        .eq('member_id', userId)

      trainingProgress = lessonProgress?.length
        ? lessonProgress.filter((p: { completed: boolean }) => p.completed).length / lessonProgress.length
        : 0
    } catch (error) {
      console.warn('lesson_progress table not found, using fallback')
      trainingProgress = 0
    }

    // Get pending follow-ups - use fallback to avoid errors
    let pendingFollowups = 0
    try {
      const { count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', userId)
        .eq('status', 'prospect')
      pendingFollowups = count || 0
    } catch (error) {
      console.warn('Error fetching pending followups:', error)
      pendingFollowups = 0
    }

    // Mock recent activities - provide safe fallback
    const recentActivities = [
      {
        id: '1',
        type: 'signup',
        description: 'Created account',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'login',
        description: 'Logged in to dashboard',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      }
    ]

    // Get suggested training - use fallback to avoid errors
    let suggestedTraining = undefined
    try {
      const { data: availableCourses } = await supabase
        .from('training_courses')
        .select('id, title')
        .eq('is_published', true)
        .order('order_index', { ascending: true })
        .limit(1)
      suggestedTraining = availableCourses?.[0]?.title
    } catch (error) {
      console.warn('training_courses table not found, using fallback')
      suggestedTraining = 'Getting Started Training'
    }

    const response: DashboardMetricsResponse = {
      metrics: {
        contactsThisWeek: contactsThisWeek || 0,
        emailsToday: 0, // Mock for now since no emails table
        trainingProgress: Math.round(trainingProgress * 100) / 100,
      },
      recentActivities,
      quickActions: {
        hasPendingFollowups: pendingFollowups > 0,
        suggestedTraining: suggestedTraining,
      },
    }

    return apiResponse(response, 200)
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    return apiError('Failed to retrieve dashboard metrics', 500)
  }
})

function getCommunicationDescription(communication: DatabaseCommunication): string {
  switch (communication.type) {
    case 'email':
      return `Sent email: ${communication.subject}`
    case 'note':
      return `Added note: ${communication.content.substring(0, 50)}${communication.content.length > 50 ? '...' : ''}`
    case 'activity':
      const activityType = communication.metadata?.activity_type
      switch (activityType) {
        case 'training_completed':
          return `Completed training: ${communication.metadata?.video_title || 'video'}`
        case 'training_started':
          return `Started training: ${communication.metadata?.video_title || 'video'}`
        case 'contact_added':
          return `Added new contact`
        default:
          return communication.subject || communication.content.substring(0, 50)
      }
    default:
      return communication.subject || communication.content.substring(0, 50)
  }
}
