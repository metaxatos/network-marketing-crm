import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'
import type { EmailTemplateResponse } from '@/types/api'

// GET /api/emails/templates - Get available email templates
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Get member's company ID
    const member = await getCurrentMember(userId)
    
    if (!member?.company_id) {
      return apiError('Company not found', 404)
    }

    // Get email templates for the company
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('id, name, subject, body_html, category, variables')
      .eq('company_id', member.company_id)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    const response: EmailTemplateResponse = {
      templates: templates?.map(template => ({
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