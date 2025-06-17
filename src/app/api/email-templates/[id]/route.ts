import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuthWithContext } from '@/lib/api-helpers'
import { type ApiResponse } from '@/types'

type RouteContext = {
  params: {
    id: string
  }
}

// GET /api/email-templates/[id] - Get specific email template details
export const GET = withAuthWithContext<any, RouteContext>(async (
  req: NextRequest,
  userId: string,
  { params }
) => {
  try {
    const { id } = params
    if (!id) {
      return apiError('Template ID is required', 400)
    }

    const supabase = await createClient()

    const { data: template, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .eq('member_id', userId)
      .single()

    if (error) {
      console.error('Error fetching template:', error.message)
      if (error.code === 'PGRST116') {
        return apiError('Template not found', 404)
      }
      throw error
    }

    if (!template) {
      return apiError('Template not found', 404)
    }

    return apiResponse(template, 200)
  } catch (error) {
    console.error('[GET TEMPLATE]', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to fetch template',
      500
    )
  }
})
