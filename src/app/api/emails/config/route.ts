import { NextRequest } from 'next/server'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function GET() {
  try {
    const resendConfigured = !!process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@ourteam.gr'
    
    return apiResponse({
      resend_configured: resendConfigured,
      from_email: fromEmail,
      environment: process.env.NODE_ENV || 'development',
      message: resendConfigured 
        ? 'Email service is properly configured' 
        : 'Email service is not configured. Add RESEND_API_KEY to environment variables.'
    })
  } catch (error) {
    return apiError('Failed to check email configuration', 500)
  }
} 