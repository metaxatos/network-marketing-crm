// Core user and authentication types
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

// NEW: Simplified Member with merged profile data
export interface Member {
  id: string
  company_id: string
  sponsor_id?: string
  email?: string
  phone?: string
  username?: string
  // Merged from member_profiles:
  first_name?: string
  last_name?: string
  avatar_url?: string
  timezone?: string
  position?: 'left' | 'right'
  level: number
  status: 'active' | 'inactive' | 'suspended'
  // Preferences stored as JSON
  preferences?: UserPreferences
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  notifications_enabled: boolean
  email_reminders: boolean
  celebration_animations: boolean
  theme: 'light' | 'dark' | 'auto'
}

// NEW: Simplified Contact with inline notes
export interface Contact {
  id: string
  member_id: string
  company_id: string
  name: string
  phone?: string
  email?: string
  status: ContactStatus
  tags: string[]
  // NEW: Notes stored inline instead of separate table
  notes?: string
  custom_fields: Record<string, any>
  last_contacted_at?: string
  created_at: string
  updated_at: string
}

export type ContactStatus = 'lead' | 'customer' | 'team_member' | 'inactive'

// NEW: Unified Communication table
export interface Communication {
  id: string
  member_id: string
  contact_id?: string
  type: CommunicationType
  direction: 'inbound' | 'outbound'
  subject?: string
  content?: string
  metadata: Record<string, any>
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed'
  sent_at?: string
  created_at: string
}

export type CommunicationType = 'email' | 'sms' | 'call' | 'note' | 'meeting'

// Dashboard and activity types
export interface DashboardMetrics {
  contacts_this_week: number
  emails_today: number
  training_progress: number
  last_updated: string
}

export interface Activity {
  id: string
  member_id: string
  activity_type: ActivityType
  description: string
  metadata: Record<string, any>
  created_at: string
}

export type ActivityType = 'contact_added' | 'email_sent' | 'training_completed' | 'goal_achieved' | 'milestone_reached'

// NEW: Unified Email Templates (company + personal)
export interface EmailTemplate {
  id: string
  company_id?: string
  member_id?: string // For personal templates
  name: string
  subject: string
  body_html: string
  body_text?: string
  category: EmailCategory
  variables: string[]
  template_type: 'system' | 'company' | 'personal'
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EmailCategory = 'follow_up' | 'invitation' | 'welcome' | 'thank_you' | 'training'

export interface EmailHistory {
  id: string
  member_id: string
  subject: string
  status: EmailStatus
  recipient_count: number
  sent_at: string
  template_id?: string
}

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'bounced'

// NEW: Simplified Training Videos (flattened structure)
export interface TrainingVideo {
  id: string
  company_id: string
  title: string
  description?: string
  video_url: string
  video_platform: 'youtube' | 'vimeo' | 'wistia' | 'direct'
  thumbnail_url?: string
  duration_seconds?: number
  category?: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

// NEW: Simplified Member Progress
export interface MemberProgress {
  id: string
  member_id: string
  video_id: string
  progress_seconds: number
  completed: boolean
  last_watched_at?: string
  created_at: string
  updated_at: string
}

export interface UserProgress {
  total_videos: number
  completed_videos: number
  completion_percentage: number
  total_watch_time: number
}

// NEW: Simplified Landing Pages
export interface LandingPage {
  id: string
  member_id: string
  slug: string
  title: string
  meta_description?: string
  content: PageContent
  views_count: number // Simplified analytics
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface PageContent {
  sections: PageSection[]
}

export interface PageSection {
  id: string
  type: SectionType
  props: Record<string, any>
  order_index: number
}

export type SectionType = 'hero' | 'lead_form' | 'testimonial' | 'features' | 'video' | 'text' | 'image'

export interface LeadCapture {
  id: string
  landing_page_id: string
  contact_id: string
  form_data: Record<string, any>
  ip_address?: string
  user_agent?: string
  referrer?: string
  captured_at: string
}

// NEW: Events system
export interface Event {
  id: string
  company_id: string
  member_id: string
  title: string
  description?: string
  event_type: 'training' | 'meeting' | 'webinar' | 'social'
  start_time: string
  end_time: string
  timezone: string
  location?: string
  max_attendees?: number
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  member_id: string
  status: 'registered' | 'attended' | 'cancelled'
  registered_at: string
  updated_at: string
}

// UI and component types
export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  action: () => void
  color: 'primary' | 'success' | 'celebration'
}

export interface ProgressMetric {
  label: string
  current: number
  target: number
  percentage: number
  color: 'primary' | 'success' | 'celebration'
}

export interface EmptyStateConfig {
  icon: string
  title: string
  description: string
  actionText?: string
  onAction?: () => void
}

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    has_more: boolean
    next_cursor?: string
  }
}

// Form and validation types
export interface FormField {
  name: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select'
  label: string
  placeholder?: string
  required: boolean
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength'
  value?: any
  message: string
}

// Celebration and animation types
export interface CelebrationConfig {
  type: 'confetti' | 'bounce' | 'glow' | 'pulse'
  duration: number
  intensity: 'low' | 'medium' | 'high'
  trigger: 'immediate' | 'delayed'
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
} 