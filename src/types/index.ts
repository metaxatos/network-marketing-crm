// Core user and authentication types
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Member {
  id: string
  company_id: string
  sponsor_id?: string
  email?: string
  phone?: string
  username?: string
  position?: 'left' | 'right'
  level: number
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
}

export interface MemberProfile {
  member_id: string
  first_name: string
  last_name: string
  avatar_url?: string
  timezone?: string
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  notifications_enabled: boolean
  email_reminders: boolean
  celebration_animations: boolean
  theme: 'light' | 'dark' | 'auto'
}

// Contact management types
export interface Contact {
  id: string
  member_id: string
  name: string
  phone?: string
  email?: string
  status: ContactStatus
  tags: string[]
  custom_fields: Record<string, any>
  last_contacted_at?: string
  created_at: string
  updated_at: string
}

export type ContactStatus = 'lead' | 'customer' | 'team_member' | 'inactive'

export interface ContactNote {
  id: string
  contact_id: string
  member_id: string
  content: string
  created_at: string
}

export interface ContactInteraction {
  id: string
  contact_id: string
  interaction_type: InteractionType
  metadata: Record<string, any>
  created_at: string
}

export type InteractionType = 'email_sent' | 'note_added' | 'status_changed' | 'call_made' | 'meeting_scheduled'

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

// Email and communication types
export interface EmailTemplate {
  id: string
  company_id: string
  name: string
  subject: string
  body_html: string
  body_text: string
  category: EmailCategory
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EmailCategory = 'follow_up' | 'invitation' | 'welcome' | 'thank_you' | 'training'

export interface SentEmail {
  id: string
  member_id: string
  contact_id: string
  template_id?: string
  subject: string
  body_html: string
  status: EmailStatus
  sent_at?: string
  opened_at?: string
  clicked_at?: string
  created_at: string
}

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'bounced'

export interface EmailHistory {
  id: string
  member_id: string
  subject: string
  status: EmailStatus
  recipient_count: number
  sent_at: string
  template_id?: string
}

// Personal template variations
export interface PersonalEmailTemplate {
  id: string
  member_id: string
  company_id: string
  parent_template_id: string
  name: string
  subject: string
  body_html: string
  body_text: string
  variables: string[]
  is_favorite: boolean
  usage_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

// Bulk email jobs
export interface BulkEmailJob {
  id: string
  member_id: string
  company_id: string
  template_id?: string
  personal_template_id?: string
  contact_ids: string[]
  custom_variables: Record<string, any>
  total_count: number
  sent_count: number
  failed_count: number
  status: BulkEmailStatus
  started_at?: string
  completed_at?: string
  created_at: string
}

export type BulkEmailStatus = 'pending' | 'processing' | 'completed' | 'failed'

// Training and learning types
export interface Course {
  id: string
  company_id: string
  title: string
  description: string
  thumbnail_url?: string
  duration_minutes: number
  order_index: number
  is_required: boolean
  lessons: Lesson[]
  created_at: string
}

export interface TrainingCourse {
  id: string
  company_id: string
  title: string
  description: string
  thumbnail_url?: string
  duration_minutes: number
  order_index: number
  is_required: boolean
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  video_url: string
  duration_seconds: number
  order_index: number
  content?: string
}

export interface UserProgress {
  total_courses: number
  completed_courses: number
  completion_percentage: number
  current_streak: number
  total_watch_time: number
}

export interface CourseVideo {
  id: string
  course_id: string
  title: string
  video_url: string
  duration_seconds: number
  order_index: number
}

export interface CourseProgress {
  member_id: string
  course_id: string
  last_video_id?: string
  last_position_seconds: number
  completed_videos: string[]
  completion_percentage: number
  completed_at?: string
  updated_at: string
}

// Landing pages and funnels types
export interface LandingPage {
  id: string
  member_id: string
  slug: string
  title: string
  meta_description?: string
  template_id: string
  content: PageContent
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