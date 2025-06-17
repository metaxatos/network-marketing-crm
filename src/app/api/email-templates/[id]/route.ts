import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'

// GET /api/email-templates/[id] - Get specific email template details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const handler = withAuth(async (request: NextRequest, userId: string) => {
    try {
      const supabase = await createApiClient(request)
      const templateId = params.id

      // Get template details
      const { data: template, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('member_id', userId) // Ensure user can only access their own templates
        .single()

      if (error || !template) {
        return apiError('Template not found', 404)
      }

      return apiResponse({
        id: template.id,
        name: template.name,
        subject: template.subject,
        body_html: template.body_html,
        body_text: template.body_text,
        category: template.category,
        variables: template.variables || [],
      }, 200)
    } catch (error) {
      console.error('Get email template error:', error)
      return apiError('Failed to retrieve email template', 500)
    }
  })

  return handler(req)
}
