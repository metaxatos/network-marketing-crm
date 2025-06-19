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
    
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    // Get contacts added this week
    const { count: contactsThisWeek } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)
      .gte('created_at', startOfWeek.toISOString())

    // Get emails sent today (from communications table)
    const { count: emailsToday } = await supabase
      .from('communications')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)
      .eq('type', 'email')
      .gte('created_at', startOfDay.toISOString())

    // Get training progress (from member_progress table)
    const { data: videoProgress } = await supabase
      .from('member_progress')
      .select('completed')
      .eq('member_id', userId)

    const trainingProgress = videoProgress?.length
      ? videoProgress.filter((p: VideoProgress) => p.completed).length / videoProgress.length
      : 0

    // Get recent activities from communications table (replaces member_activities)
    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .eq('member_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const recentActivities = communications?.map((comm: DatabaseCommunication) => ({
      id: comm.id,
      type: comm.type,
      description: getCommunicationDescription(comm),
      timestamp: comm.created_at,
    })) || []

    // Check for pending follow-ups (contacts not contacted recently)
    const { count: pendingFollowups } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)
      .eq('status', 'lead')
      .or(`last_contacted_at.is.null,last_contacted_at.lt.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`)

    // Get suggested training (incomplete videos)
    const { data: incompleteVideos } = await supabase
      .from('training_videos')
      .select(`
        id,
        title,
        member_progress!left (
          completed
        )
      `)
      .eq('member_progress.member_id', userId)
      .eq('member_progress.completed', false)
      .eq('is_published', true)
      .order('order_index', { ascending: true })
      .limit(1)

    const response: DashboardMetricsResponse = {
      metrics: {
        contactsThisWeek: contactsThisWeek || 0,
        emailsToday: emailsToday || 0,
        trainingProgress: Math.round(trainingProgress * 100) / 100,
      },
      recentActivities,
      quickActions: {
        hasPendingFollowups: (pendingFollowups || 0) > 0,
        suggestedTraining: incompleteVideos?.[0]?.title,
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
