import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()

    // Get user's current context
    const [
      { data: recentContacts },
      { data: incompleteCourses },
      { data: lastActivity },
      { count: pendingFollowups },
    ] = await Promise.all([
      // Recent contacts without follow-up
      supabase
        .from('contacts')
        .select('id, name, created_at')
        .eq('member_id', userId)
        .eq('status', 'lead')
        .is('last_contacted_at', null)
        .order('created_at', { ascending: false })
        .limit(3),
      
      // Incomplete training courses
      supabase
        .from('training_courses')
        .select(`
          id,
          title,
          member_course_progress!inner (
            completion_percentage,
            last_position_seconds
          )
        `)
        .eq('member_course_progress.member_id', userId)
        .lt('member_course_progress.completion_percentage', 1)
        .order('member_course_progress.updated_at', { ascending: false })
        .limit(1),
      
      // Last activity to determine context
      supabase
        .from('member_activities')
        .select('activity_type, metadata')
        .eq('member_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      
      // Count pending follow-ups
      supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', userId)
        .eq('status', 'lead')
        .or(`last_contacted_at.is.null,last_contacted_at.lt.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`),
    ])

    // Generate suggested actions based on context
    const suggestedActions = []

    // Suggest following up with recent contacts
    if (recentContacts && recentContacts.length > 0) {
      suggestedActions.push({
        id: 'follow_up_contacts',
        type: 'contact_followup',
        title: 'Follow up with new contacts',
        description: `You have ${recentContacts.length} new contact${recentContacts.length > 1 ? 's' : ''} to follow up with`,
        priority: 'high',
        data: {
          contacts: recentContacts.map(c => ({ id: c.id, name: c.name })),
        },
      })
    }

    // Suggest continuing training
    if (incompleteCourses && incompleteCourses.length > 0) {
      const course = incompleteCourses[0]
      suggestedActions.push({
        id: 'continue_training',
        type: 'training_continue',
        title: 'Continue your training',
        description: `Resume "${course.title}" - ${Math.round((course.member_course_progress?.[0]?.completion_percentage || 0) * 100)}% complete`,
        priority: 'medium',
        data: {
          courseId: course.id,
          lastPosition: course.member_course_progress?.[0]?.last_position_seconds || 0,
        },
      })
    }

    // Suggest adding contacts if none exist
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)

    if (totalContacts === 0) {
      suggestedActions.push({
        id: 'add_first_contact',
        type: 'contact_add',
        title: 'Add your first contact',
        description: 'Start building your network by adding your first contact',
        priority: 'high',
        data: {},
      })
    }

    // Time-based suggestions
    const hour = new Date().getHours()
    if (hour >= 9 && hour <= 11) {
      suggestedActions.push({
        id: 'morning_emails',
        type: 'email_send',
        title: 'Send morning follow-ups',
        description: 'Morning is a great time to reach out to your contacts',
        priority: 'medium',
        data: {},
      })
    }

    return apiResponse({
      suggestedActions: suggestedActions.slice(0, 3), // Return top 3 actions
      stats: {
        pendingFollowups: pendingFollowups || 0,
        totalContacts: totalContacts || 0,
        hasIncompleteTraining: (incompleteCourses?.length || 0) > 0,
      },
    }, 200)
  } catch (error) {
    console.error('Quick actions error:', error)
    return apiError('Failed to retrieve quick actions', 500)
  }
}) 