// API Request Types
export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  companyId?: string
  sponsorId?: string
}

export interface CreateContactRequest {
  name: string
  phone?: string
  email?: string
  status?: 'lead' | 'customer' | 'team_member'
  tags?: string[]
}

export interface UpdateContactRequest {
  name?: string
  phone?: string
  email?: string
  status?: 'lead' | 'customer' | 'team_member'
  tags?: string[]
}

export interface AddNoteRequest {
  content: string
}

export interface SendEmailRequest {
  contactId: string
  templateId: string
  variables?: Record<string, string>
}

export interface UpdateEmailStatusRequest {
  status: 'sent' | 'failed' | 'bounced'
}

export interface EnrollCourseRequest {
  courseId: string
}

export interface UpdateProgressRequest {
  videoId: string
  positionSeconds: number
  completed: boolean
}

export interface CreateLandingPageRequest {
  title: string
  slug: string
  templateId: string
  content?: any
}

export interface UpdateLandingPageRequest {
  title?: string
  content?: any
  isPublished?: boolean
}

export interface LeadCaptureRequest {
  name: string
  email: string
  phone?: string
  utmSource?: string
  utmCampaign?: string
  utmMedium?: string
}

// API Response Types
export interface DashboardMetricsResponse {
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

export interface ContactListResponse {
  contacts: Array<{
    id: string
    name: string
    phone?: string
    email?: string
    status: string
    lastContactedAt?: string
  }>
  nextCursor?: string
  hasMore: boolean
}

export interface EmailTemplateResponse {
  templates: Array<{
    id: string
    name: string
    category: string
    preview: string
  }>
}

export interface EmailHistoryResponse {
  emails: Array<{
    id: string
    contactName: string
    subject: string
    status: string
    sentAt?: string
    openedAt?: string
  }>
}

export interface CourseListResponse {
  courses: Array<{
    id: string
    title: string
    thumbnailUrl?: string
    durationMinutes: number
    progress?: {
      percentage: number
      lastVideoId?: string
      lastPosition?: number
    }
  }>
  recommendedNext?: string
}

export interface TrainingProgressResponse {
  progress: {
    courseCompletion: number
    videosCompleted: number
    totalVideos: number
  }
}

export interface LandingPageResponse {
  pages: Array<{
    id: string
    slug: string
    title: string
    isPublished: boolean
    visits?: number
    leads?: number
  }>
} 