import { NextRequest } from 'next/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'
import { createClient } from '@/lib/supabase/server'

// Register for an event
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    // Extract event ID from URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const eventId = pathParts[pathParts.length - 2] // Get ID from /api/events/[id]/register

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return apiError('Event not found', 404)
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('member_id', userId)
      .single()

    if (existingRegistration) {
      return apiError('Already registered for this event', 409)
    }

    // Check if event is full (if max_attendees is set)
    if (event.max_attendees) {
      const { count: currentRegistrations } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId)
        .eq('status', 'registered')

      if (currentRegistrations && currentRegistrations >= event.max_attendees) {
        return apiError('Event is full', 409)
      }
    }

    // Create registration
    const registrationData = {
      event_id: eventId,
      member_id: userId,
      status: 'registered',
      registered_at: new Date().toISOString()
    }

    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert([registrationData])
      .select()
      .single()

    if (regError) {
      console.error('Error creating registration:', regError)
      return apiError('Failed to register for event', 500)
    }

    return apiResponse(registration, 201)

  } catch (error) {
    console.error('Event registration API error:', error)
    return apiError('Internal server error', 500)
  }
})

// Cancel event registration
export const DELETE = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    // Extract event ID from URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const eventId = pathParts[pathParts.length - 2] // Get ID from /api/events/[id]/register

    // Find and delete registration
    const { data: registration, error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('member_id', userId)
      .select()
      .single()

    if (error || !registration) {
      return apiError('Registration not found', 404)
    }

    return apiResponse({ message: 'Registration cancelled successfully' })

  } catch (error) {
    console.error('Cancel event registration API error:', error)
    return apiError('Internal server error', 500)
  }
}) 