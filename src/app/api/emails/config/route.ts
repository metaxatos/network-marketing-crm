import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const resendConfigured = !!process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@ourteam.gr'
  
  return apiResponse({
    resend_configured: resendConfigured,
    from_email: fromEmail,
    environment: process.env.NODE_ENV,
    message: resendConfigured 
      ? 'Email service is properly configured' 
      : 'RESEND_API_KEY not found in environment variables'
  })
} 