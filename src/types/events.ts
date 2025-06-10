// Event Types
export type EventType = 
  | 'team_meeting'
  | 'opportunity_presentation' 
  | 'product_presentation'
  | 'training_workshop'
  | 'local_meetup'
  | 'national_event'
  | 'company_event';

export type EventFormat = 'live' | 'online';

export type MeetingPlatform = 'jitsi' | 'google_meet' | 'zoom' | 'custom';

export type RegistrationStatus = 'registered' | 'attended' | 'no_show' | 'cancelled';

export type InviteType = 'team' | 'contacts' | 'custom';

export type EventView = 'calendar' | 'list';

export type EventListFilter = 'all' | 'mine' | 'attending' | 'upcoming' | 'past';

// Main Event Interface
export interface Event {
  id: string;
  member_id: string;
  company_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  format: EventFormat;
  start_time: string; // ISO timestamp
  end_time: string; // ISO timestamp
  timezone: string;
  meeting_url?: string;
  meeting_platform?: MeetingPlatform;
  location_name?: string;
  location_address?: string;
  location_coordinates?: [number, number]; // [lat, lng]
  max_attendees?: number;
  is_team_only: boolean;
  registration_required: boolean;
  reminder_settings?: {
    email?: number[]; // hours before event
    sms?: number[]; // hours before event
  };
  tags: string[];
  featured_image_url?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/joined fields
  is_creator?: boolean;
  registration_count?: number;
  attendance_count?: number;
  user_registration?: EventRegistration;
  is_live?: boolean; // Currently happening
  can_join?: boolean; // User can join meeting
}

// Event Registration
export interface EventRegistration {
  id: string;
  event_id: string;
  member_id?: string;
  contact_id?: string;
  email: string;
  status: RegistrationStatus;
  registered_at: string;
  checked_in_at?: string;
  notes?: string;
}

// Event Invitation
export interface EventInvitation {
  id: string;
  event_id: string;
  sent_by: string;
  sent_to_type: InviteType;
  recipient_ids: string[];
  email_template_id?: string;
  sent_at: string;
  opened_count: number;
  clicked_count: number;
}

// Event Statistics
export interface EventStats {
  total_events: number;
  upcoming_events: number;
  events_this_month: number;
  total_attendees: number;
  attendance_rate: number; // percentage
  popular_event_types: {
    type: EventType;
    count: number;
  }[];
}

// Create Event Data
export interface CreateEventData {
  title: string;
  description?: string;
  event_type: EventType;
  format: EventFormat;
  start_time: string;
  end_time: string;
  timezone: string;
  meeting_platform?: MeetingPlatform;
  meeting_url?: string;
  location_name?: string;
  location_address?: string;
  max_attendees?: number;
  is_team_only: boolean;
  registration_required: boolean;
  tags: string[];
  featured_image_url?: string;
}

// Event Filters
export interface EventFilters {
  event_types?: EventType[];
  formats?: EventFormat[];
  date_range?: {
    start: string;
    end: string;
  };
  tags?: string[];
  search?: string;
}

// Calendar Event (for react-big-calendar)
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Event; // Full event data
}

// Video Conferencing
export interface JitsiConfig {
  roomName: string;
  userInfo?: {
    displayName?: string;
    email?: string;
  };
  configOverwrite?: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    enableWelcomePage?: boolean;
    enableUserRolesBasedOnToken?: boolean;
  };
  interfaceConfigOverwrite?: {
    TOOLBAR_BUTTONS?: string[];
    SETTINGS_SECTIONS?: string[];
    SHOW_JITSI_WATERMARK?: boolean;
    SHOW_WATERMARK_FOR_GUESTS?: boolean;
  };
}

// Event Type Configuration
export const EVENT_TYPE_CONFIG: Record<EventType, {
  label: string;
  icon: string;
  description: string;
  color: string;
  defaultDuration: number; // minutes
}> = {
  team_meeting: {
    label: 'Team Meeting',
    icon: '👥',
    description: 'Regular calls/meetings with your team',
    color: 'blue',
    defaultDuration: 60
  },
  opportunity_presentation: {
    label: 'Opportunity Presentation',
    icon: '🚀',
    description: 'Recruiting events to share the business opportunity',
    color: 'purple',
    defaultDuration: 90
  },
  product_presentation: {
    label: 'Product Presentation',
    icon: '🛍️',
    description: 'Sales meetings focused on products/services',
    color: 'green',
    defaultDuration: 45
  },
  training_workshop: {
    label: 'Training Workshop',
    icon: '📚',
    description: 'Skill-building and educational sessions',
    color: 'yellow',
    defaultDuration: 120
  },
  local_meetup: {
    label: 'Local Meetup',
    icon: '☕',
    description: 'In-person presentations and networking',
    color: 'orange',
    defaultDuration: 90
  },
  national_event: {
    label: 'National Event',
    icon: '🎪',
    description: 'Large-scale events for your country/region',
    color: 'red',
    defaultDuration: 480
  },
  company_event: {
    label: 'Company Event',
    icon: '🏢',
    description: 'Corporate-hosted events and conferences',
    color: 'indigo',
    defaultDuration: 240
  }
};

// Meeting Platform Configuration
export const MEETING_PLATFORM_CONFIG: Record<MeetingPlatform, {
  label: string;
  icon: string;
  description: string;
  urlPattern?: RegExp;
  generateUrl?: (options: any) => string;
}> = {
  jitsi: {
    label: 'Jitsi Meet',
    icon: '🎥',
    description: 'Free, secure video conferencing',
    urlPattern: /^https:\/\/meet\.jit\.si\/[a-zA-Z0-9-_]+/,
    generateUrl: (options) => `https://meet.jit.si/${options.roomName}`
  },
  google_meet: {
    label: 'Google Meet',
    icon: '📹',
    description: 'Google\'s video conferencing solution',
    urlPattern: /^https:\/\/meet\.google\.com\/[a-z-]+/
  },
  zoom: {
    label: 'Zoom',
    icon: '🔍',
    description: 'Popular video conferencing platform',
    urlPattern: /^https:\/\/.*\.zoom\.us\/j\/\d+/
  },
  custom: {
    label: 'Custom Link',
    icon: '🔗',
    description: 'Any other meeting platform'
  }
}; 