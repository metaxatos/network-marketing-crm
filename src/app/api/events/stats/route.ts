import { NextRequest } from 'next/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'
import { createClient } from '@/lib/supabase/server'

export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get all events for the user's team/company
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        event_registrations(
          id,
          status
        )
      `)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching events for stats:', error)
      return apiError('Failed to fetch event statistics', 500)
    }

    // Calculate statistics
    const totalEvents = events?.length || 0
    const upcomingEvents = events?.filter((event: any) => new Date(event.start_time) > now).length || 0
    const eventsThisMonth = events?.filter((event: any) => new Date(event.start_time) >= thisMonth).length || 0
    
    // Calculate attendance metrics
    let totalAttendees = 0
    let totalRegistrations = 0
    const eventTypeCounts: Record<string, number> = {}

    events?.forEach((event: any) => {
      const registrations = event.event_registrations || []
      const attendees = registrations.filter((reg: any) => reg.status === 'attended')
      
      totalRegistrations += registrations.length
      totalAttendees += attendees.length
      
      // Count event types
      eventTypeCounts[event.event_type] = (eventTypeCounts[event.event_type] || 0) + 1
    })

    // Calculate popular event types
    const popularEventTypes = Object.entries(eventTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const attendanceRate = totalRegistrations > 0 
      ? Math.round((totalAttendees / totalRegistrations) * 100) 
      : 0

    const stats = {
      total_events: totalEvents,
      upcoming_events: upcomingEvents,
      events_this_month: eventsThisMonth,
      total_attendees: totalAttendees,
      attendance_rate: attendanceRate,
      popular_event_types: popularEventTypes
    }

    return apiResponse(stats)

  } catch (error) {
    console.error('Event stats API error:', error)
    return apiError('Internal server error', 500)
  }
}) 