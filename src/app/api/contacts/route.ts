import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getPaginationParams, validateBody, sanitizeInput, isValidEmail, isValidPhone } from '@/lib/api-helpers'
import type { ContactListResponse, CreateContactRequest } from '@/types/api'

// GET /api/contacts - List contacts with search/filter
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    const searchParams = req.nextUrl.searchParams
    const { page = 1, limit = 20, cursor } = getPaginationParams(searchParams)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Build query
    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('member_id', userId)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply cursor-based pagination if cursor provided
    if (cursor) {
      query = query.lt('id', cursor)
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)

    // Execute query with pagination
    const { data: contacts, error } = await query.limit(limit)

    if (error) {
      throw error
    }

    const response: ContactListResponse = {
      contacts: contacts?.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        status: contact.status,
        lastContactedAt: contact.last_contacted_at,
      })) || [],
      nextCursor: contacts && contacts.length === limit ? contacts[contacts.length - 1].id : undefined,
      hasMore: contacts ? contacts.length === limit : false,
    }

    return apiResponse(response, 200)
  } catch (error) {
    console.error('List contacts error:', error)
    return apiError('Failed to retrieve contacts', 500)
  }
})

// POST /api/contacts - Create new contact
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Validate request body
    const body = await validateBody<CreateContactRequest>(req, (data) => {
      if (!data.name) {
        throw new Error('Contact name is required')
      }

      if (data.email && !isValidEmail(data.email)) {
        throw new Error('Invalid email format')
      }

      if (data.phone && !isValidPhone(data.phone)) {
        throw new Error('Invalid phone number format')
      }

      return {
        name: sanitizeInput(data.name),
        phone: data.phone ? sanitizeInput(data.phone) : undefined,
        email: data.email ? data.email.toLowerCase().trim() : undefined,
        status: data.status || 'lead',
        tags: data.tags || [],
      }
    })

    // Check for duplicate contact
    if (body.email) {
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('member_id', userId)
        .eq('email', body.email)
        .single()

      if (existing) {
        return apiError('A contact with this email already exists', 400)
      }
    }

    // Create contact
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        member_id: userId,
        name: body.name,
        phone: body.phone,
        email: body.email,
        status: body.status,
        tags: body.tags,
        custom_fields: {},
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log activity
    await supabase.from('member_activities').insert({
      member_id: userId,
      activity_type: 'contact_added',
      metadata: {
        contact_id: contact.id,
        contact_name: contact.name,
      },
    })

    // Log interaction
    await supabase.from('contact_interactions').insert({
      contact_id: contact.id,
      interaction_type: 'contact_added',
      metadata: {
        source: 'manual',
      },
    })

    return apiResponse({
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        status: contact.status,
        tags: contact.tags,
        createdAt: contact.created_at,
      },
    }, 201, 'Contact created successfully')
  } catch (error) {
    console.error('Create contact error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to create contact',
      400
    )
  }
}) 