import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'
import { DEFAULT_EMAIL_TEMPLATES } from '@/lib/email-templates'

// Define template type to match the DEFAULT_EMAIL_TEMPLATES structure
interface DefaultEmailTemplate {
  name: string
  category: string
  subject: string
  body_html: string
  variables?: string[]
  is_active?: boolean
}

type RouteContext = {}

// GET /api/debug/setup - Check and optionally seed data
export const GET = withAuth<any, RouteContext>(async (req: NextRequest, userId: string, context: RouteContext) => {
  try {
    const supabase = await createClient()
    const searchParams = req.nextUrl.searchParams
    const seed = searchParams.get('seed') === 'true'
    
    // Get member to check company
    const { data: member } = await supabase
      .from('members')
      .select('id, company_id')
      .eq('id', userId)
      .single()

    if (!member?.company_id) {
      return apiError('No company found for user', 404)
    }

    // Check existing email templates
    const { data: existingTemplates, count: templateCount } = await supabase
      .from('email_templates')
      .select('id, name, category', { count: 'exact' })
      .eq('company_id', member.company_id)

    const info = {
      userId,
      companyId: member.company_id,
      existingTemplates: templateCount || 0,
      templates: existingTemplates || []
    }

    // If seed is requested and no templates exist, create them
    if (seed && templateCount === 0) {
      const templatesToSeed = DEFAULT_EMAIL_TEMPLATES.map((template: DefaultEmailTemplate) => ({
        ...template,
        company_id: member.company_id
      }))

      const { data: newTemplates, error: seedError } = await supabase
        .from('email_templates')
        .insert(templatesToSeed)
        .select('id, name, category')

      if (seedError) {
        console.error('Template seeding error:', seedError)
        return apiError(`Failed to seed templates: ${seedError.message}`, 500)
      }

      return apiResponse({
        ...info,
        seeded: true,
        seedCount: newTemplates?.length || 0,
        newTemplates: newTemplates || []
      })
    }

    return apiResponse({
      ...info,
      seeded: false
    })

  } catch (error) {
    console.error('Setup debug error:', error)
    return apiError('Setup check failed', 500)
  }
}) 