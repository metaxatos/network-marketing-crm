import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, withAuth, getCurrentMember } from '@/lib/api-helpers'
import type { EmailTemplate } from '@/types'

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
    const searchParams = req.nextUrl.searchParams
    const language = searchParams.get('language')
    const category = searchParams.get('category')
    const isQuickAction = searchParams.get('is_quick_action')
    const targetAudience = searchParams.get('target_audience')
    
    const supabase = await createApiClient(req)
    
    console.log('[Email Templates API] Fetching templates with filters:', {
      language,
      category,
      isQuickAction,
      targetAudience
    })

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

    // Build query with all Phase 1 fields
    let query = supabase
      .from('email_templates')
      .select(`
        id,
        company_id,
        member_id,
        name,
        subject,
        body_html,
        body_text,
        category,
        variables,
        template_type,
        is_active,
        language,
        preview_text,
        usage_priority,
        target_audience,
        is_quick_action,
        usage_count,
        last_used_at,
        created_at,
        updated_at
      `)
      .eq('is_active', true)

    // Company/system filtering
    if (userId && memberCompanyId) {
      // User is authenticated and has a company - get both system and company templates
      query = query.or(`template_type.eq.system,and(template_type.eq.company,company_id.eq.${memberCompanyId})`)
    } else {
      // User not authenticated or no company - just get system templates
      query = query.eq('template_type', 'system')
    }
    
    // Apply Phase 3 filters
    if (language) {
      query = query.eq('language', language)
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (isQuickAction === 'true') {
      query = query.eq('is_quick_action', true)
    }
    
    if (targetAudience) {
      query = query.eq('target_audience', targetAudience)
    }

    const { data: templates, error } = await query
      .order('usage_priority', { ascending: false, nullsFirst: false })
      .order('template_type', { ascending: true }) // System templates first
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching templates:', error)
      throw error
    }

    console.log(`[Email Templates API] Found ${templates?.length || 0} templates`)

    return apiResponse({
      templates: templates || []
    }, 200)
  } catch (error) {
    console.error('Get email templates error:', error)
    return apiError('Failed to retrieve email templates', 500)
  }
} 