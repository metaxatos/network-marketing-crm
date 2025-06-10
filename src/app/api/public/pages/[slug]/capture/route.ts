import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, validateBody, sanitizeInput, isValidEmail, isValidPhone } from '@/lib/api-helpers'
import type { LeadCaptureRequest } from '@/types/api'

// POST /api/public/pages/[slug]/capture - Handle lead capture form (no auth required)
export async function POST(req: NextRequest) {
  try {
    const pathParts = req.nextUrl.pathname.split('/')
    const pageSlug = pathParts[pathParts.length - 2] // Get slug from path
    
    if (!pageSlug) {
      return apiError('Page slug is required', 400)
    }

    // Validate request body
    const body = await validateBody<LeadCaptureRequest>(req, (data) => {
      if (!data.name || !data.email) {
        throw new Error('Name and email are required')
      }

      if (!isValidEmail(data.email)) {
        throw new Error('Invalid email format')
      }

      if (data.phone && !isValidPhone(data.phone)) {
        throw new Error('Invalid phone number format')
      }

      return {
        name: sanitizeInput(data.name),
        email: data.email.toLowerCase().trim(),
        phone: data.phone ? sanitizeInput(data.phone) : undefined,
        utmSource: data.utmSource,
        utmCampaign: data.utmCampaign,
        utmMedium: data.utmMedium,
      }
    })

    const supabase = await createClient()

    // Get landing page and member info
    const { data: page } = await supabase
      .from('landing_pages')
      .select(`
        id,
        member_id,
        title
      `)
      .eq('slug', pageSlug)
      .eq('is_published', true)
      .single()

    if (!page) {
      return apiError('Page not found', 404)
    }

    // Check for existing contact
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('member_id', page.member_id)
      .eq('email', body.email)
      .single()

    let contactId: string

    if (existingContact) {
      // Update existing contact
      contactId = existingContact.id
      
      // Add note about re-submission
      await supabase.from('contact_notes').insert({
        contact_id: contactId,
        member_id: page.member_id,
        content: `Re-submitted form on landing page: ${page.title}`,
      })
    } else {
      // Create new contact
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          member_id: page.member_id,
          name: body.name,
          email: body.email,
          phone: body.phone,
          status: 'lead',
          tags: ['landing_page_lead'],
          custom_fields: {
            source: `Landing Page: ${page.title}`,
            utm_source: body.utmSource,
            utm_campaign: body.utmCampaign,
            utm_medium: body.utmMedium,
          },
        })
        .select()
        .single()

      if (contactError || !newContact) {
        throw new Error('Failed to create contact')
      }

      contactId = newContact.id
    }

    // Create lead capture record
    const { error: captureError } = await supabase
      .from('lead_captures')
      .insert({
        landing_page_id: page.id,
        contact_id: contactId,
        form_data: body,
        ip_address: req.headers.get('x-forwarded-for') || null,
        user_agent: req.headers.get('user-agent') || null,
        referrer: req.headers.get('referer') || null,
      })

    if (captureError) {
      console.error('Lead capture error:', captureError)
    }

    // Log interaction
    await supabase.from('contact_interactions').insert({
      contact_id: contactId,
      interaction_type: 'lead_captured',
      metadata: {
        landing_page_id: page.id,
        form_type: 'lead_capture',
      },
    })

    // Log activity for the member
    await supabase.from('member_activities').insert({
      member_id: page.member_id,
      activity_type: 'lead_captured',
      metadata: {
        contact_name: body.name,
        landing_page_title: page.title,
      },
    })

    return apiResponse({
      success: true,
      redirectUrl: '/thank-you',
      contactId,
    }, 201, 'Lead captured successfully')
  } catch (error) {
    console.error('Lead capture error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to capture lead',
      400
    )
  }
} 