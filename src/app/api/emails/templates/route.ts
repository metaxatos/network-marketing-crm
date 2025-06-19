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
  template_type: string
  company_id?: string
}

// GET /api/emails/templates - Get available email templates
export async function GET(req: NextRequest) {
  try {
    const supabase = await createApiClient(req)
    
    console.log('[Email Templates API] Fetching templates...')

    // Try to get user context, but don't fail if it's not available
    let userId: string | null = null
    let memberCompanyId: string | null = null
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
      
      if (userId) {
        console.log('[Email Templates API] User authenticated:', userId)
        
        // Get current member to find their company_id
        const { data: member } = await supabase
          .from('members')
          .select('company_id')
          .eq('id', userId)
          .single()
        
        memberCompanyId = member?.company_id || null
        console.log('[Email Templates API] Member company:', memberCompanyId)
      }
    } catch (authError) {
      console.warn('[Email Templates API] Auth context not available, proceeding with system templates only:', authError)
    }

    // Get email templates - always include system templates, plus company templates if user is authenticated
    let query = supabase
      .from('email_templates')
      .select('id, name, subject, body_html, category, variables, template_type, company_id')
      .eq('is_active', true)

    if (userId && memberCompanyId) {
      // User is authenticated and has a company - get both system and company templates
      query = query.or(`template_type.eq.system,and(template_type.eq.company,company_id.eq.${memberCompanyId})`)
    } else {
      // User not authenticated or no company - just get system templates
      query = query.eq('template_type', 'system')
    }

    const { data: templates, error } = await query
      .order('template_type', { ascending: true }) // System templates first
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching templates:', error)
      throw error
    }

    console.log(`[Email Templates API] Found ${templates?.length || 0} templates`)

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
} 