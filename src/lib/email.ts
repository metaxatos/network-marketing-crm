import { Resend } from 'resend'

// Initialize Resend client with error handling
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured. Email functionality will be disabled.')
    return null
  }
  return new Resend(apiKey)
}

export const resend = getResendClient()

// Email configuration
export const EMAIL_CONFIG = {
  fromEmail: 'noreply@yoursite.com', // Replace with your verified domain
  fromName: 'Your Network Marketing Team',
  replyTo: 'support@yoursite.com', // Replace with your support email
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
}

// Email template types
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: 'welcome' | 'follow_up' | 'training' | 'promotional' | 'personal'
  variables: string[] // Variables that can be customized (e.g., ['firstName', 'companyName'])
}

// Email sending result
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}): Promise<EmailResult> {
  if (!resend) {
    // In development, simulate success
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Simulated email:', { to, subject })
      return { success: true, messageId: 'dev_' + Date.now() }
    }
    
    return { 
      success: false, 
      error: 'Email service not configured. Please add RESEND_API_KEY to your environment variables.' 
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
      to: [to],
      subject,
      html,
      text,
      replyTo: replyTo || EMAIL_CONFIG.replyTo,
    })

    if (error) {
      console.error('Email sending error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email sending error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Send templated email
export async function sendTemplatedEmail({
  to,
  template,
  variables = {},
  customSubject,
  replyTo,
}: {
  to: string
  template: EmailTemplate
  variables?: Record<string, string>
  customSubject?: string
  replyTo?: string
}): Promise<EmailResult> {
  // Replace variables in subject and content
  let subject = customSubject || template.subject
  let content = template.content

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    subject = subject.replace(new RegExp(placeholder, 'g'), value)
    content = content.replace(new RegExp(placeholder, 'g'), value)
  })

  return sendEmail({
    to,
    subject,
    html: content,
    text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    replyTo,
  })
} 