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
  [key: string]: any // Allow additional dynamic columns
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

    // First, check what columns exist in the email_templates table
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'email_templates')
      .eq('table_schema', 'public')

    if (tableError) {
      console.error('[Email Templates API] Could not check table structure:', tableError)
      // Fall back to absolute minimum query
      const { data: basicTemplates, error: basicError } = await supabase
        .from('email_templates')
        .select('id, name, subject, body_html, category')
        .eq('is_active', true)
        .order('name', { ascending: true })
        
      if (basicError) {
        throw basicError
      }
      
      const safeBasicTemplates = Array.isArray(basicTemplates) ? basicTemplates as unknown as DatabaseEmailTemplate[] : []
      
      const templatesWithDefaults = safeBasicTemplates.map(template => ({
        ...template,
        body_text: template.body_text || '',
        variables: template.variables || [],
        template_type: template.template_type || 'personal',
        company_id: template.company_id || null,
        member_id: template.member_id || null,
        is_active: template.is_active ?? true,
        language: template.language, // Keep original value, don't default to 'en'
        preview_text: template.preview_text || null,
        usage_priority: template.usage_priority || 0,
        target_audience: template.target_audience || 'general',
        is_quick_action: template.is_quick_action || false,
        usage_count: template.usage_count || 0,
        last_used_at: template.last_used_at || null,
        created_at: template.created_at || new Date().toISOString(),
        updated_at: template.updated_at || new Date().toISOString()
      }))
      
      return apiResponse({ templates: templatesWithDefaults }, 200)
    }

    // Build dynamic select based on available columns
    const availableColumns = new Set(tableInfo?.map(col => col.column_name) || [])
    console.log('[Email Templates API] Available columns:', Array.from(availableColumns))
    
    // Core columns that should always exist
    const coreColumns = ['id', 'name', 'subject', 'body_html', 'category', 'is_active']
    
    // Additional columns that might exist
    const optionalColumns = [
      'body_text', 'variables', 'template_type', 'company_id', 'member_id',
      'created_at', 'updated_at', 'language', 'preview_text', 'usage_priority',
      'target_audience', 'is_quick_action', 'usage_count', 'last_used_at'
    ]
    
    // Build select string with only existing columns
    const selectColumns = [
      ...coreColumns,
      ...optionalColumns.filter(col => availableColumns.has(col))
    ]
    
    console.log('[Email Templates API] Selecting columns:', selectColumns)
    
    // Build the query
    let query = supabase
      .from('email_templates')
      .select(selectColumns.join(', '))
      .eq('is_active', true)

    // Apply filtering based on available columns
    if (availableColumns.has('template_type')) {
      // Company/system filtering
      if (userId && memberCompanyId) {
        // User is authenticated and has a company - get both system and company templates
        query = query.or(`template_type.eq.system,and(template_type.eq.company,company_id.eq.${memberCompanyId})`)
        console.log('[Email Templates API] Filtering for authenticated user with company:', memberCompanyId)
      } else {
        // User not authenticated or no company - just get system templates
        query = query.eq('template_type', 'system')
        console.log('[Email Templates API] Filtering for system templates only (no auth or company)')
      }
    } else {
      console.log('[Email Templates API] No template_type column, skipping filtering')
    }
    
    // Apply Phase 3 filters if columns exist
    if (language && availableColumns.has('language')) {
      // Strict language filtering - only return templates for the requested language
      query = query.eq('language', language)
      console.log('[Email Templates API] Filtering by language (strict):', language)
    }
    
    if (category && availableColumns.has('category')) {
      query = query.eq('category', category)
      console.log('[Email Templates API] Filtering by category:', category)
    }
    
    if (isQuickAction === 'true' && availableColumns.has('is_quick_action')) {
      query = query.eq('is_quick_action', true)
      console.log('[Email Templates API] Filtering for quick actions only')
    }
    
    if (targetAudience && availableColumns.has('target_audience')) {
      query = query.eq('target_audience', targetAudience)
      console.log('[Email Templates API] Filtering by target audience:', targetAudience)
    }

    // Apply ordering based on available columns
    if (availableColumns.has('usage_priority')) {
      query = query.order('usage_priority', { ascending: false, nullsFirst: false })
    }
    if (availableColumns.has('template_type')) {
      query = query.order('template_type', { ascending: true })
    }
    query = query.order('category', { ascending: true })
    query = query.order('name', { ascending: true })

    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      throw error
    }

    // Ensure templates is an array and properly typed
    const safeTemplates = Array.isArray(templates) ? templates as unknown as DatabaseEmailTemplate[] : []

    // Add default values for missing columns
    // Note: Don't default language to 'en' to ensure strict language filtering works
    const templatesWithDefaults = safeTemplates.map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text || '',
      category: template.category,
      variables: template.variables || [],
      template_type: template.template_type || 'personal',
      company_id: template.company_id || null,
      member_id: template.member_id || null,
      is_active: template.is_active ?? true,
      language: template.language, // Keep original value, don't default to 'en'
      preview_text: template.preview_text || null,
      usage_priority: template.usage_priority || 0,
      target_audience: template.target_audience || 'general',
      is_quick_action: template.is_quick_action || false,
      usage_count: template.usage_count || 0,
      last_used_at: template.last_used_at || null,
      created_at: template.created_at || new Date().toISOString(),
      updated_at: template.updated_at || new Date().toISOString()
    }))

    console.log(`[Email Templates API] Successfully fetched ${templatesWithDefaults.length} templates`)

    return apiResponse({
      templates: templatesWithDefaults
    }, 200)
  } catch (error) {
    console.error('Get email templates error:', error)
    return apiError('Failed to retrieve email templates', 500)
  }
} 