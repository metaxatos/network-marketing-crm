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
  fromEmail: process.env.RESEND_FROM_EMAIL || 'info@ourteam.gr', // Updated to use info@ourteam.gr
  fromName: 'OurTeam Network Marketing',
  replyTo: process.env.RESEND_REPLY_TO || 'info@ourteam.gr', // Updated reply-to as well
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://ourteam.gr',
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

// Send email function with Supabase Edge Function fallback
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  fromName,
  useEdgeFunction = false,
}: {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  fromName?: string
  useEdgeFunction?: boolean
}): Promise<EmailResult> {
  
  // Option 1: Use Supabase Edge Function (can be more reliable)
  if (useEdgeFunction) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        console.log('📧 Using Supabase Edge Function for email:', { to, subject })
        
        const response = await fetch(`${supabaseUrl}/functions/v1/resend-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
            replyTo: replyTo || EMAIL_CONFIG.replyTo,
            fromName: fromName || EMAIL_CONFIG.fromName,
          }),
        })
        
        const result = await response.json()
        
        if (result.success) {
          console.log('✅ Email sent via Edge Function:', result.messageId)
          return { success: true, messageId: result.messageId }
        } else {
          console.error('❌ Edge Function error:', result.error)
          // Fall back to direct Resend API
        }
      }
    } catch (error) {
      console.error('❌ Edge Function failed, falling back to direct API:', error)
      // Fall back to direct Resend API
    }
  }
  
  // Option 2: Direct Resend API (original method)
  if (!resend) {
    // In development, simulate success
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Simulated email:', { to, subject, fromName: fromName || EMAIL_CONFIG.fromName })
      return { success: true, messageId: 'dev_' + Date.now() }
    }
    
    console.error('❌ RESEND_API_KEY not configured. Email cannot be sent.')
    return { 
      success: false, 
      error: 'Email service not configured. Please add RESEND_API_KEY to Netlify environment variables. Visit https://resend.com/api-keys to get your API key.' 
    }
  }

  try {
    const senderName = fromName || EMAIL_CONFIG.fromName
    console.log('📧 Sending email via direct Resend API:', { to, subject, fromName: senderName })
    
    const { data, error } = await resend.emails.send({
      from: `${senderName} <${EMAIL_CONFIG.fromEmail}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      replyTo: replyTo || EMAIL_CONFIG.replyTo,
    })

    if (error) {
      console.error('❌ Email sending error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email sent successfully via direct API:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('❌ Email sending error:', error)
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