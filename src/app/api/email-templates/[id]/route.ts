import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError } from '@/lib/api-helpers'
import { type ApiResponse } from '@/types'

// GET /api/email-templates/[id] - Get specific email template details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const supabase = await createApiClient(req)
    const templateId = params.id

    // Inlined 'withAuth' logic for build stability
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error(`[GET /api/email-templates/${templateId}] Auth error:`, authError.message)
      return apiError('Authentication failed: ' + authError.message, 401)
    }

    if (!user) {
      console.warn(`[GET /api/email-templates/${templateId}] No authenticated user found`)
      return apiError('Authentication required', 401)
    }
    const userId = user.id
    // End of inlined 'withAuth' logic

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

    const responsePayload = {
      id: template.id,
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text,
      category: template.category,
      variables: template.variables || [],
    }
    return apiResponse(responsePayload, 200)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[GET /api/email-templates/[id]] Unexpected error:`, errorMessage)
    return apiError('Failed to retrieve email template', 500)
  }
}
