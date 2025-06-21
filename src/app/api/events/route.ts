import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'

export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters for filtering
    const eventTypes = searchParams.get('event_types')?.split(',')
    const formats = searchParams.get('formats')?.split(',')
    const search = searchParams.get('search')
    const dateStart = searchParams.get('date_start')
    const dateEnd = searchParams.get('date_end')

    let query = supabase
      .from('events')
      .select(`
        *,
        event_registrations(
          id,
          member_id,
          status,
          registered_at
        )
      `)
      .order('start_time', { ascending: true })

    // Apply filters
    if (eventTypes && eventTypes.length > 0) {
      query = query.in('event_type', eventTypes)
    }

    if (formats && formats.length > 0) {
      query = query.in('format', formats)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return apiError('Failed to fetch events', 500)
    }

    // Transform events and handle recurring occurrences
    const allEvents: any[] = []
    
    events?.forEach((event: any) => {
      const userRegistration = event.event_registrations?.find(
        (reg: any) => reg.member_id === userId
      )
      
      const baseEvent = {
        id: event.id,
        member_id: event.member_id,
        company_id: null, // TODO: Get from member profile
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        format: event.format,
        timezone: 'UTC', // Default timezone
        meeting_url: event.meeting_url,
        meeting_platform: event.meeting_platform || 'jitsi',
        location_name: event.location,
        max_attendees: event.max_attendees,
        is_team_only: !event.is_public,
        registration_required: event.registration_enabled ?? true,
        tags: [], // TODO: Add tags field to events table
        created_at: event.created_at,
        updated_at: event.updated_at,
        is_creator: event.member_id === userId,
        registration_count: event.event_registrations?.length || 0,
        attendance_count: event.event_registrations?.filter((reg: any) => reg.status === 'attended').length || 0,
        user_registration: userRegistration || undefined,
        is_live: false, // TODO: Calculate if event is currently live
        can_join: userRegistration && new Date() >= new Date(event.start_time) && new Date() <= new Date(event.end_time)
      }

      // Add the main event occurrence
      if (event.start_time) {
        allEvents.push({
          ...baseEvent,
          start_time: event.start_time,
          end_time: event.end_time,
          occurrence_type: 'main'
        })
      }

      // Add recurring occurrences if they exist
      if (event.next_occurrence_1) {
        // Calculate end time for recurring event (assume same duration as original)
        const originalDuration = event.end_time && event.start_time 
          ? new Date(event.end_time).getTime() - new Date(event.start_time).getTime()
          : 3600000 // Default 1 hour if no end time

        const occurrence1EndTime = new Date(new Date(event.next_occurrence_1).getTime() + originalDuration).toISOString()
        
        allEvents.push({
          ...baseEvent,
          id: `${event.id}_occ1`, // Unique ID for this occurrence
          start_time: event.next_occurrence_1,
          end_time: occurrence1EndTime,
          occurrence_type: 'recurring',
          title: `${event.title} (Recurring)`,
          can_join: userRegistration && new Date() >= new Date(event.next_occurrence_1) && new Date() <= new Date(occurrence1EndTime)
        })
      }

      if (event.next_occurrence_2) {
        // Calculate end time for recurring event
        const originalDuration = event.end_time && event.start_time 
          ? new Date(event.end_time).getTime() - new Date(event.start_time).getTime()
          : 3600000 // Default 1 hour if no end time

        const occurrence2EndTime = new Date(new Date(event.next_occurrence_2).getTime() + originalDuration).toISOString()
        
        allEvents.push({
          ...baseEvent,
          id: `${event.id}_occ2`, // Unique ID for this occurrence
          start_time: event.next_occurrence_2,
          end_time: occurrence2EndTime,
          occurrence_type: 'recurring',
          title: `${event.title} (Recurring)`,
          can_join: userRegistration && new Date() >= new Date(event.next_occurrence_2) && new Date() <= new Date(occurrence2EndTime)
        })
      }
    })

    // Apply date filters to all events (including recurring occurrences)
    let filteredEvents = allEvents
    if (dateStart) {
      filteredEvents = filteredEvents.filter(event => event.start_time >= dateStart)
    }
    if (dateEnd) {
      filteredEvents = filteredEvents.filter(event => event.start_time <= dateEnd)
    }

    // Sort by start time
    filteredEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return apiResponse({
      events: filteredEvents,
      total: filteredEvents.length
    })

  } catch (error) {
    console.error('Events API error:', error)
    return apiError('Internal server error', 500)
  }
})

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    const { title, description, event_type, format, start_time, end_time } = body
    
    if (!title || !event_type || !format || !start_time || !end_time) {
      return apiError('Missing required fields', 400)
    }

    const eventData = {
      member_id: userId,
      title,
      description,
      event_type,
      format,
      start_time,
      end_time,
      location: body.location_name,
      meeting_url: body.meeting_url,
      meeting_platform: body.meeting_platform || 'jitsi',
      max_attendees: body.max_attendees,
      is_public: !body.is_team_only,
      registration_enabled: body.registration_required ?? true
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return apiError('Failed to create event', 500)
    }

    // Transform the response to match expected format
    const transformedEvent = {
      id: event.id,
      member_id: event.member_id,
      company_id: null, // TODO: Get from member profile
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      format: event.format,
      start_time: event.start_time,
      end_time: event.end_time,
      timezone: 'UTC',
      meeting_url: event.meeting_url,
      meeting_platform: event.meeting_platform,
      location_name: event.location,
      max_attendees: event.max_attendees,
      is_team_only: !event.is_public,
      registration_required: event.registration_enabled,
      tags: [],
      created_at: event.created_at,
      updated_at: event.updated_at,
      is_creator: true,
      registration_count: 0,
      attendance_count: 0,
      is_live: false,
      can_join: false
    }

    return apiResponse(transformedEvent, 201)

  } catch (error) {
    console.error('Create event API error:', error)
    return apiError('Internal server error', 500)
  }
}) 