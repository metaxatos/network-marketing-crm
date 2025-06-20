import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'

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

// GET /api/dashboard/metrics - Using our EXISTING database tables
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

    // 1. CONTACTS THIS WEEK (using existing contacts table)
    const { count: contactsThisWeek } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)
      .gte('created_at', startOfWeek.toISOString())

    // 2. EMAILS TODAY (using existing sent_emails table)
    const { count: emailsToday } = await supabase
      .from('sent_emails')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)
      .gte('sent_at', startOfDay.toISOString())

    // 3. TRAINING PROGRESS (using existing lesson_progress + course_lessons tables)
    let trainingProgress = 0
    const { data: allLessons } = await supabase
      .from('course_lessons')
      .select('id')
      .eq('is_published', true)

    if (allLessons && allLessons.length > 0) {
      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('member_id', userId)
        .eq('completed', true)

      trainingProgress = completedLessons ? 
        completedLessons.length / allLessons.length : 0
    }

    // 4. RECENT ACTIVITIES (using existing member_activities table)
    const { data: activities } = await supabase
      .from('member_activities')
      .select('id, activity_type, metadata, created_at')
      .eq('member_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentActivities = activities?.map((activity: any) => ({
      id: activity.id,
      type: activity.activity_type,
      description: getActivityDescription(activity),
      timestamp: activity.created_at,
    })) || [
      // Fallback activities if none exist
      {
        id: '1',
        type: 'signup',
        description: 'Welcome! You\'ve successfully created your account',
        timestamp: new Date().toISOString(),
      }
    ]

    // 5. PENDING FOLLOW-UPS (using existing contacts table)
    const { count: pendingFollowups } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)
      .eq('status', 'prospect')

    // 6. SUGGESTED TRAINING (using existing training_courses table)
    const { data: nextCourse } = await supabase
      .from('training_courses')
      .select('title')
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
        suggestedTraining: nextCourse?.[0]?.title || 'Getting Started',
      },
    }

    return apiResponse(response, 200)
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    return apiError('Failed to retrieve dashboard metrics', 500)
  }
})

function getActivityDescription(activity: { activity_type: string; metadata?: any }): string {
  switch (activity.activity_type) {
    case 'contact_added':
      return `Added new contact: ${activity.metadata?.contact_name || 'Unknown'}`
    case 'email_sent':
      return `Sent email: ${activity.metadata?.subject || 'Email'}`
    case 'training_completed':
      return `Completed training: ${activity.metadata?.lesson_title || 'Lesson'}`
    case 'login':
      return 'Logged in to dashboard'
    case 'signup':
      return 'Created account - welcome!'
    default:
      return 'Activity recorded'
  }
}
