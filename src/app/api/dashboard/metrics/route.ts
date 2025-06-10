import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'
import type { DashboardMetricsResponse } from '@/types/api'

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

    // Get emails sent today
    const { count: emailsToday } = await supabase
      .from('sent_emails')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)
      .gte('sent_at', startOfDay.toISOString())

    // Get training progress
    const { data: courseProgress } = await supabase
      .from('member_course_progress')
      .select('completion_percentage')
      .eq('member_id', userId)

    const trainingProgress = courseProgress?.length
      ? courseProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / courseProgress.length
      : 0

    // Get recent activities
    const { data: activities } = await supabase
      .from('member_activities')
      .select('*')
      .eq('member_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const recentActivities = activities?.map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      description: getActivityDescription(activity),
      timestamp: activity.created_at,
    })) || []

    // Check for pending follow-ups
    const { count: pendingFollowups } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)
      .eq('status', 'lead')
      .or(`last_contacted_at.is.null,last_contacted_at.lt.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`)

    // Get suggested training
    const { data: incompleteCourses } = await supabase
      .from('training_courses')
      .select(`
        id,
        title,
        member_course_progress!inner (
          completion_percentage
        )
      `)
      .eq('member_course_progress.member_id', userId)
      .lt('member_course_progress.completion_percentage', 1)
      .order('member_course_progress.updated_at', { ascending: false })
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
        suggestedTraining: incompleteCourses?.[0]?.title,
      },
    }

    return apiResponse(response, 200)
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    return apiError('Failed to retrieve dashboard metrics', 500)
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
    default:
      return activity.activity_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  }
} 