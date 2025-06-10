'use server';

import { Event, EventStats, CreateEventData, EventRegistration, EventInvitation, EventFilters } from '@/types/events';
import { generateJitsiLink, generateEventRoomName } from '@/lib/video-conferencing';

// Mock data for development - replace with real Supabase queries
const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    member_id: 'member-1',
    company_id: 'company-1',
    title: 'Weekly Team Check-in',
    description: 'Our regular team meeting to discuss progress, share wins, and plan for the week ahead.',
    event_type: 'team_meeting',
    format: 'online',
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour duration
    timezone: 'America/New_York',
    meeting_platform: 'jitsi',
    meeting_url: 'https://meet.jit.si/weekly-team-checkin-123456',
    is_team_only: true,
    registration_required: false,
    tags: ['weekly', 'team', 'recurring'],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_creator: true,
    registration_count: 8,
    attendance_count: 6,
    is_live: false,
    can_join: false
  },
  {
    id: 'evt-2',
    member_id: 'member-1',
    company_id: 'company-1',
    title: 'Product Launch Presentation',
    description: 'Exciting presentation about our new product line. Perfect for prospects and team members!',
    event_type: 'product_presentation',
    format: 'online',
    start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // 1.5 hour duration
    timezone: 'America/New_York',
    meeting_platform: 'jitsi',
    meeting_url: 'https://meet.jit.si/product-launch-presentation-789012',
    is_team_only: false,
    registration_required: true,
    tags: ['product', 'launch', 'presentation'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_creator: true,
    registration_count: 25,
    attendance_count: 0,
    is_live: false,
    can_join: false
  },
  {
    id: 'evt-3',
    member_id: 'member-2',
    company_id: 'company-1',
    title: 'Opportunity Presentation: Building Your Future',
    description: 'Learn about the amazing business opportunity and how you can build a successful network marketing business.',
    event_type: 'opportunity_presentation',
    format: 'live',
    start_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    end_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hour duration
    timezone: 'America/New_York',
    location_name: 'Marriott Downtown Hotel',
    location_address: '123 Business Ave, New York, NY 10001',
    location_coordinates: [40.7128, -74.0060],
    max_attendees: 50,
    is_team_only: false,
    registration_required: true,
    tags: ['opportunity', 'recruiting', 'business'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_creator: false,
    registration_count: 32,
    attendance_count: 0,
    is_live: false,
    can_join: false,
    user_registration: {
      id: 'reg-1',
      event_id: 'evt-3',
      member_id: 'member-1',
      email: 'user@example.com',
      status: 'registered',
      registered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'evt-4',
    member_id: 'member-1',
    company_id: 'company-1',
    title: 'Sales Skills Training Workshop',
    description: 'Master the art of selling with our comprehensive sales training. Learn proven techniques and scripts.',
    event_type: 'training_workshop',
    format: 'online',
    start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hour duration
    timezone: 'America/New_York',
    meeting_platform: 'zoom',
    meeting_url: 'https://zoom.us/j/1234567890',
    max_attendees: 100,
    is_team_only: true,
    registration_required: true,
    tags: ['training', 'sales', 'skills'],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    is_creator: true,
    registration_count: 45,
    attendance_count: 0,
    is_live: false,
    can_join: false
  },
  {
    id: 'evt-5',
    member_id: 'member-3',
    company_id: 'company-1',
    title: 'Coffee & Networking Meetup',
    description: 'Casual local meetup for coffee, networking, and sharing success stories. Bring a friend!',
    event_type: 'local_meetup',
    format: 'live',
    start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    end_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hour duration
    timezone: 'America/New_York',
    location_name: 'Starbucks Downtown',
    location_address: '456 Main Street, New York, NY 10002',
    location_coordinates: [40.7282, -73.9942],
    max_attendees: 15,
    is_team_only: false,
    registration_required: false,
    tags: ['networking', 'casual', 'local'],
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    is_creator: false,
    registration_count: 8,
    attendance_count: 0,
    is_live: false,
    can_join: false
  },
  {
    id: 'evt-6',
    member_id: 'member-1',
    company_id: 'company-1',
    title: 'Live Company Convention Stream',
    description: 'Watch the live stream of our annual company convention with exciting announcements and training.',
    event_type: 'company_event',
    format: 'online',
    start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (past event)
    end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // 8 hour duration
    timezone: 'America/New_York',
    meeting_platform: 'custom',
    meeting_url: 'https://company.com/live-stream',
    is_team_only: false,
    registration_required: true,
    tags: ['convention', 'company', 'annual'],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_creator: false,
    registration_count: 1250,
    attendance_count: 987,
    is_live: false,
    can_join: false,
    user_registration: {
      id: 'reg-2',
      event_id: 'evt-6',
      member_id: 'member-1',
      email: 'user@example.com',
      status: 'attended',
      registered_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      checked_in_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'evt-7',
    member_id: 'member-1',
    company_id: 'company-1',
    title: 'Q1 National Training Event',
    description: 'Join team leaders from across the country for intensive training and mastermind sessions.',
    event_type: 'national_event',
    format: 'live',
    start_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    end_time: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(), // 3 day event
    timezone: 'America/New_York',
    location_name: 'Grand Convention Center',
    location_address: '789 Convention Blvd, Las Vegas, NV 89109',
    location_coordinates: [36.1699, -115.1398],
    max_attendees: 5000,
    is_team_only: false,
    registration_required: true,
    tags: ['national', 'training', 'Q1'],
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    is_creator: false,
    registration_count: 2847,
    attendance_count: 0,
    is_live: false,
    can_join: false
  }
];

/**
 * Get all events with optional filtering
 */
export async function getEvents(filters?: EventFilters): Promise<Event[]> {
  // In production, this would be a Supabase query with RLS
  let events = [...MOCK_EVENTS];

  if (filters) {
    if (filters.event_types?.length) {
      events = events.filter(event => filters.event_types!.includes(event.event_type));
    }

    if (filters.formats?.length) {
      events = events.filter(event => filters.formats!.includes(event.format));
    }

    if (filters.date_range) {
      const startDate = new Date(filters.date_range.start);
      const endDate = new Date(filters.date_range.end);
      events = events.filter(event => {
        const eventStart = new Date(event.start_time);
        return eventStart >= startDate && eventStart <= endDate;
      });
    }

    if (filters.tags?.length) {
      events = events.filter(event => 
        filters.tags!.some(tag => event.tags.includes(tag))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      events = events.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
  }

  return events;
}

/**
 * Get event statistics for the dashboard
 */
export async function getEventStats(): Promise<EventStats> {
  const events = await getEvents();
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const upcomingEvents = events.filter(event => new Date(event.start_time) > now);
  const eventsThisMonth = events.filter(event => new Date(event.start_time) >= thisMonth);
  
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendance_count || 0), 0);
  const totalRegistrations = events.reduce((sum, event) => sum + (event.registration_count || 0), 0);
  
  // Calculate popular event types
  const eventTypeCounts: Record<string, number> = {};
  events.forEach(event => {
    eventTypeCounts[event.event_type] = (eventTypeCounts[event.event_type] || 0) + 1;
  });

  const popularEventTypes = Object.entries(eventTypeCounts)
    .map(([type, count]) => ({ type: type as any, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total_events: events.length,
    upcoming_events: upcomingEvents.length,
    events_this_month: eventsThisMonth.length,
    total_attendees: totalAttendees,
    attendance_rate: totalRegistrations > 0 ? Math.round((totalAttendees / totalRegistrations) * 100) : 0,
    popular_event_types: popularEventTypes
  };
}

/**
 * Create a new event
 */
export async function createEvent(data: CreateEventData): Promise<Event> {
  // Generate meeting URL for Jitsi events
  let meetingUrl = data.meeting_url;
  if (data.format === 'online' && data.meeting_platform === 'jitsi' && !meetingUrl) {
    const roomName = generateEventRoomName({
      companyName: 'YourCompany', // Would get from user context
      eventTitle: data.title,
      eventType: data.event_type,
      timestamp: Date.now()
    });

    meetingUrl = generateJitsiLink({
      roomName,
      userDisplayName: 'Event Host', // Would get from user context
      userEmail: 'host@example.com' // Would get from user context
    });
  }

  const newEvent: Event = {
    id: `evt-${Date.now()}`,
    member_id: 'member-1', // Would get from auth context
    company_id: 'company-1', // Would get from user context
    title: data.title,
    description: data.description,
    event_type: data.event_type,
    format: data.format,
    start_time: data.start_time,
    end_time: data.end_time,
    timezone: data.timezone,
    meeting_platform: data.meeting_platform,
    meeting_url: meetingUrl,
    location_name: data.location_name,
    location_address: data.location_address,
    max_attendees: data.max_attendees,
    is_team_only: data.is_team_only,
    registration_required: data.registration_required,
    tags: data.tags,
    featured_image_url: data.featured_image_url,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_creator: true,
    registration_count: 0,
    attendance_count: 0,
    is_live: false,
    can_join: false
  };

  // In production, save to Supabase
  MOCK_EVENTS.unshift(newEvent);

  return newEvent;
}

/**
 * Update an existing event
 */
export async function updateEvent(eventId: string, data: Partial<CreateEventData>): Promise<Event> {
  const eventIndex = MOCK_EVENTS.findIndex(event => event.id === eventId);
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }

  const existingEvent = MOCK_EVENTS[eventIndex];
  
  // Check if user is the creator or has permission
  if (!existingEvent.is_creator) {
    throw new Error('Not authorized to update this event');
  }

  const updatedEvent: Event = {
    ...existingEvent,
    ...data,
    updated_at: new Date().toISOString()
  };

  MOCK_EVENTS[eventIndex] = updatedEvent;
  return updatedEvent;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const eventIndex = MOCK_EVENTS.findIndex(event => event.id === eventId);
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }

  const event = MOCK_EVENTS[eventIndex];
  if (!event.is_creator) {
    throw new Error('Not authorized to delete this event');
  }

  MOCK_EVENTS.splice(eventIndex, 1);
}

/**
 * Register for an event
 */
export async function registerForEvent(eventId: string): Promise<EventRegistration> {
  const event = MOCK_EVENTS.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.registration_required && event.max_attendees && event.registration_count! >= event.max_attendees) {
    throw new Error('Event is full');
  }

  const registration: EventRegistration = {
    id: `reg-${Date.now()}`,
    event_id: eventId,
    member_id: 'member-1', // Would get from auth context
    email: 'user@example.com', // Would get from user context
    status: 'registered',
    registered_at: new Date().toISOString()
  };

  // Update event registration count
  event.registration_count = (event.registration_count || 0) + 1;
  event.user_registration = registration;

  return registration;
}

/**
 * Cancel event registration
 */
export async function cancelEventRegistration(eventId: string): Promise<void> {
  const event = MOCK_EVENTS.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.user_registration) {
    event.registration_count = Math.max(0, (event.registration_count || 0) - 1);
    event.user_registration = undefined;
  }
}

/**
 * Get event registrations (for event creators)
 */
export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
  // Mock registrations - in production, query from Supabase
  return [
    {
      id: 'reg-1',
      event_id: eventId,
      member_id: 'member-2',
      email: 'user1@example.com',
      status: 'registered',
      registered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'reg-2',
      event_id: eventId,
      member_id: 'member-3',
      email: 'user2@example.com',
      status: 'registered',
      registered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

/**
 * Send event invitations
 */
export async function sendEventInvitations(
  eventId: string, 
  recipientType: 'team' | 'contacts' | 'custom',
  recipientIds: string[]
): Promise<EventInvitation> {
  const invitation: EventInvitation = {
    id: `inv-${Date.now()}`,
    event_id: eventId,
    sent_by: 'member-1', // Would get from auth context
    sent_to_type: recipientType,
    recipient_ids: recipientIds,
    sent_at: new Date().toISOString(),
    opened_count: 0,
    clicked_count: 0
  };

  // In production, save to Supabase and send emails via Resend
  console.log('Sending invitations:', invitation);

  return invitation;
} 