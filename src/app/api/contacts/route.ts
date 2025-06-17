import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, withAuth, getPaginationParams, validateBody, sanitizeInput, isValidEmail, isValidPhone } from '@/lib/api-helpers'
import type { ContactListResponse, CreateContactRequest } from '@/types/api'

// Define the database contact type - Updated to match actual schema
interface DatabaseContact {
  id: string
  first_name: string
  last_name?: string
  phone?: string
  email?: string
  status: string
  created_at: string
  member_id: string
  tags?: string[]
  notes?: string
}

type RouteContext = {}

// GET /api/contacts - List contacts with search/filter
export const GET = withAuth<any, RouteContext>(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createApiClient(req)
    const searchParams = req.nextUrl.searchParams
    const { page = 1, limit = 20, cursor } = getPaginationParams(searchParams)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    console.log('[Contacts API] Fetching contacts for user:', userId)

    // Build query - Updated to match actual schema
    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('member_id', userId)
      .order('created_at', { ascending: false })

    // Apply search filter - Updated field names
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply cursor-based pagination if cursor provided
    if (cursor) {
      query = query.lt('id', cursor)
    }

    // Execute query with pagination
    const { data: contacts, error, count } = await query.limit(limit)

    if (error) {
      console.error('[Contacts API] Database error:', error)
      throw error
    }

    console.log('[Contacts API] Found contacts:', contacts?.length || 0, 'Total count:', count)

    const response: ContactListResponse = {
      contacts: contacts?.map((contact: DatabaseContact) => ({
        id: contact.id,
        name: `${contact.first_name}${contact.last_name ? ' ' + contact.last_name : ''}`,
        phone: contact.phone,
        email: contact.email,
        status: contact.status,
        lastContactedAt: undefined, // This field doesn't exist in the schema
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
export const POST = withAuth<any, RouteContext>(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createApiClient(req)
    
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
        status: data.status || 'prospect',
        tags: data.tags || [],
      }
    })

    // Split name into first and last name for database
    const nameParts = body.name.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || undefined

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

    // Create contact - Updated to match schema
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        member_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone: body.phone,
        email: body.email,
        status: body.status,
        tags: body.tags,
        notes: '',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return apiResponse({
      contact: {
        id: contact.id,
        name: `${contact.first_name}${contact.last_name ? ' ' + contact.last_name : ''}`,
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