// Hierarchical query keys for consistent caching
export const queryKeys = {
  // Core entities
  auth: ['auth'] as const,
  user: ['user'] as const,
  members: ['members'] as const,
  companies: ['companies'] as const,
  
  // Contacts (simplified - no more contact_notes or contact_interactions)
  contacts: ['contacts'] as const,
  contact: (id: string) => [...queryKeys.contacts, id] as const,
  contactNotes: (contactId: string) => [...queryKeys.contacts, contactId, 'notes'] as const, // Now stored inline
  
  // Communications (replaces sent_emails, contact_interactions, email_clicks)
  communications: ['communications'] as const,
  communication: (id: string) => [...queryKeys.communications, id] as const,
  communicationsByContact: (contactId: string) => [...queryKeys.communications, 'contact', contactId] as const,
  
  // Email templates (unified - company and personal)
  emailTemplates: () => ['email-templates'] as const,
  emailTemplate: (id: string) => [...queryKeys.emailTemplates(), id] as const,
  
  // Emails (now using communications table)
  emails: ['emails'] as const,
  emailHistory: (filters?: any) => [...queryKeys.emails, 'history', filters] as const,
  emailStats: () => [...queryKeys.emails, 'stats'] as const,
  
  // Training (simplified from courses/modules/lessons to videos)
  training: ['training'] as const,
  trainingVideos: () => [...queryKeys.training, 'videos'] as const,
  trainingVideo: (id: string) => [...queryKeys.training, 'videos', id] as const,
  memberProgress: (memberId?: string) => [...queryKeys.training, 'progress', memberId] as const,
  
  // Landing pages (simplified analytics)
  landingPages: ['landing-pages'] as const,
  landingPage: (id: string) => [...queryKeys.landingPages, id] as const,
  landingPageStats: (id: string) => [...queryKeys.landingPages, id, 'stats'] as const,
  
  // Events (new)
  events: ['events'] as const,
  event: (id: string) => [...queryKeys.events, id] as const,
  eventRegistrations: (eventId: string) => [...queryKeys.events, eventId, 'registrations'] as const,
  
  // Dashboard (updated for new schema)
  dashboard: ['dashboard'] as const,
  dashboardMetrics: () => [...queryKeys.dashboard, 'metrics'] as const,
  dashboardActivities: () => [...queryKeys.dashboard, 'activities'] as const,
  quickActions: () => [...queryKeys.dashboard, 'quick-actions'] as const,
  
  // Analytics (simplified)
  analytics: ['analytics'] as const,
  emailAnalytics: () => [...queryKeys.analytics, 'emails'] as const,
  trainingAnalytics: () => [...queryKeys.analytics, 'training'] as const,
} as const

// Helper function to invalidate related queries
export const getInvalidationQueries = {
  contacts: () => [queryKeys.contacts, queryKeys.dashboard],
  emails: () => [queryKeys.emails, queryKeys.dashboard],
  training: () => [queryKeys.training, queryKeys.dashboard],
  landingPages: () => [queryKeys.landingPages, queryKeys.dashboard],
} 