import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'
import type { EmailTemplateResponse } from '@/types/api'

// Define the database email template type
interface DatabaseEmailTemplate {
  id: string
  name: string
  subject: string
  body_html: string
  category: string
  variables?: string[]
}

type RouteContext = {}

// GET /api/email-templates - Get all email templates
export const GET = withAuth<any, RouteContext>(async (req, userId) => {
  try {
    const supabase = await createApiClient(req)
    
    console.log('[Email Templates API] Fetching templates for user:', userId)

    // Get email templates for the user (member_id based, not company_id)
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('id, name, subject, body_html, category, variables')
      .eq('member_id', userId)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    const response: EmailTemplateResponse = {
      templates: templates?.map((template: DatabaseEmailTemplate) => ({
        id: template.id,
        name: template.name,
        category: template.category,
        preview: template.body_html
          .replace(/<[^>]*>/g, '') // Strip HTML tags
          .substring(0, 100) + '...',
      })) || [],
    }

    return apiResponse(response, 200)
  } catch (error) {
    console.error('Get email templates error:', error)
    return apiError('Failed to retrieve email templates', 500)
  }
}) 