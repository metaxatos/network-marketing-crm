/**
 * Application configuration for Network Marketing CRM
 * Centralizes all environment variables and app settings
 */

export const config = {
  // App metadata
  app: {
    name: 'Network Marketing CRM',
    description: 'Your Success Companion',
    version: '0.1.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Database configuration (Supabase)
  database: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Email service configuration (Resend)
  email: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
    fromName: process.env.FROM_NAME || 'Network Marketing CRM',
  },

  // Authentication settings
  auth: {
    sessionDuration: 7 * 24 * 60 * 60, // 7 days in seconds
    redirectAfterLogin: '/dashboard',
    redirectAfterLogout: '/',
  },

  // UI/UX settings
  ui: {
    // Touch target minimum size (accessibility)
    minTouchTarget: 44,
    
    // Animation settings
    animations: {
      enabled: true,
      duration: {
        fast: 200,
        normal: 300,
        slow: 500,
      },
    },
    
    // Celebration settings
    celebrations: {
      confettiDuration: 2000,
      bounceIntensity: 'medium' as const,
      enableSounds: false, // For future implementation
    },
    
    // Pagination defaults
    pagination: {
      defaultLimit: 20,
      maxLimit: 100,
    },
  },

  // Feature flags
  features: {
    enableTraining: true,
    enableLandingPages: true,
    enableAnalytics: false, // Coming in future phases
    enableTeamManagement: false, // Coming in future phases
    enableMobileApp: false, // PWA features
  },

  // Development settings
  dev: {
    enableDebugMode: process.env.NODE_ENV === 'development',
    enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // External services
  services: {
    // Analytics (future)
    analytics: {
      enabled: false,
      trackingId: process.env.ANALYTICS_TRACKING_ID || '',
    },
    
    // Error monitoring (future)
    errorMonitoring: {
      enabled: false,
      dsn: process.env.ERROR_MONITORING_DSN || '',
    },
  },

  // Business rules
  limits: {
    maxContactsPerMember: 10000,
    maxEmailsPerDay: 100,
    maxNotesPerContact: 1000,
    maxLandingPagesPerMember: 10,
  },

  // Default user preferences
  defaultPreferences: {
    notifications_enabled: true,
    email_reminders: true,
    celebration_animations: true,
    theme: 'light' as const,
  },
} as const

// Type-safe environment variable validation
export function validateConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  )

  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
  }

  return true
}

// Helper to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature]
}

// Helper to get API base URL
export function getApiUrl(path: string = ''): string {
  const baseUrl = config.app.url
  return `${baseUrl}/api${path.startsWith('/') ? path : `/${path}`}`
}

// Helper for development mode checks
export function isDevelopment(): boolean {
  return config.dev.enableDebugMode
}

// Helper for production mode checks
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
} 