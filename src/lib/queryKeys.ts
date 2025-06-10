// Hierarchical query keys for consistent caching
export const queryKeys = {
  // Contact queries
  contacts: ['contacts'] as const,
  contactList: (filters?: {
    searchQuery?: string
    statusFilter?: string
    page?: number
  }) => [...queryKeys.contacts, 'list', filters] as const,
  contactDetail: (id: string) => 
    [...queryKeys.contacts, 'detail', id] as const,
  contactNotes: (contactId: string) =>
    [...queryKeys.contacts, 'notes', contactId] as const,
  
  // Email queries
  emails: ['emails'] as const,
  emailTemplates: () => [...queryKeys.emails, 'templates'] as const,
  emailHistory: (filters?: {
    page?: number
    status?: string
  }) => [...queryKeys.emails, 'history', filters] as const,
  emailStats: () => [...queryKeys.emails, 'stats'] as const,
  
  // Training queries
  training: ['training'] as const,
  courses: () => [...queryKeys.training, 'courses'] as const,
  courseDetail: (id: string) => 
    [...queryKeys.training, 'course', id] as const,
  lessonDetail: (courseId: string, lessonId: string) =>
    [...queryKeys.training, 'lesson', courseId, lessonId] as const,
  userProgress: () => [...queryKeys.training, 'progress'] as const,
  courseProgress: (courseId: string) =>
    [...queryKeys.training, 'progress', courseId] as const,
  
  // Dashboard queries
  dashboard: ['dashboard'] as const,
  metrics: () => [...queryKeys.dashboard, 'metrics'] as const,
  activities: (filters?: {
    page?: number
    limit?: number
  }) => [...queryKeys.dashboard, 'activities', filters] as const,
  recentContacts: () => [...queryKeys.dashboard, 'recent-contacts'] as const,
  
  // Landing page queries
  landingPages: ['landing-pages'] as const,
  landingPageList: () => [...queryKeys.landingPages, 'list'] as const,
  landingPageDetail: (id: string) =>
    [...queryKeys.landingPages, 'detail', id] as const,
  landingPageStats: (id: string) =>
    [...queryKeys.landingPages, 'stats', id] as const,
  
  // User queries
  user: ['user'] as const,
  userProfile: () => [...queryKeys.user, 'profile'] as const,
  userSettings: () => [...queryKeys.user, 'settings'] as const,
} as const

// Helper function to invalidate related queries
export const getInvalidationQueries = {
  contacts: () => [queryKeys.contacts, queryKeys.dashboard],
  emails: () => [queryKeys.emails, queryKeys.dashboard],
  training: () => [queryKeys.training, queryKeys.dashboard],
  landingPages: () => [queryKeys.landingPages, queryKeys.dashboard],
} 