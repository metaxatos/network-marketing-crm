export interface ErrorContext {
  userId?: string
  action?: string
  component?: string
  additionalData?: Record<string, any>
}

export function logError(error: Error, context?: ErrorContext) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    ...context,
  }

  if (process.env.NODE_ENV === 'production') {
    // Log to console in production (can be picked up by log aggregators)
    console.error('Application Error:', JSON.stringify(errorData, null, 2))
    
    // TODO: Add external error tracking service
    // - Sentry: Sentry.captureException(error, { contexts: { custom: context } })
    // - LogRocket: LogRocket.captureException(error)
    // - Custom endpoint: fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorData) })
  } else {
    // Development logging
    console.error('Development Error:', error)
    console.log('Error Context:', context)
  }
}

export function logEvent(eventName: string, properties?: Record<string, any>) {
  const eventData = {
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }

  if (process.env.NODE_ENV === 'production') {
    // TODO: Add analytics tracking
    // - Google Analytics: gtag('event', eventName, properties)
    // - Mixpanel: mixpanel.track(eventName, properties)
    // - Custom analytics: fetch('/api/track-event', { method: 'POST', body: JSON.stringify(eventData) })
    console.log('Event:', JSON.stringify(eventData))
  } else {
    console.log('Development Event:', eventName, properties)
  }
}

export function logPerformance(metric: string, value: number, unit: 'ms' | 's' | 'bytes' = 'ms') {
  const performanceData = {
    metric,
    value,
    unit,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }

  if (process.env.NODE_ENV === 'production') {
    console.log('Performance:', JSON.stringify(performanceData))
  }
} 