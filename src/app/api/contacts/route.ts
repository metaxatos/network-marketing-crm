import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, withAuth, getPaginationParams, validateBody, sanitizeInput, isValidEmail, isValidPhone } from '@/lib/api-helpers'
import type { ContactListResponse, CreateContactRequest } from '@/types/api'

// Define the database contact type - Updated to match actual schema
interface DatabaseContact {
  id: string
  name: string
  phone?: string
  email?: string
  status: string
  created_at: string
  member_id: string
  company_id: string
  tags?: string[]
  notes?: string
}

// GET /api/contacts - List contacts with search/filter
export const GET = withAuth(async (req: NextRequest, userId: string) => {
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
        name: contact.name,
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
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    console.log('[Create Contact] Starting contact creation for user:', userId)
    
    const supabase = await createApiClient(req)
    
    // Get current member to access company_id
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('company_id')
      .eq('id', userId)
      .single()

    if (memberError || !member) {
      console.error('[Create Contact] Member lookup error:', memberError)
      return apiError('Unable to find member profile', 400)
    }

    console.log('[Create Contact] Found member with company_id:', member.company_id)
    
    // Validate request body
    console.log('[Create Contact] Parsing request body...')
    
    const body = await validateBody<CreateContactRequest>(req, (data) => {
      console.log('[Create Contact] Raw request data:', JSON.stringify(data))
      console.log('[Create Contact] Validating data:', JSON.stringify(data))
      
      if (!data.name) {
        throw new Error('Contact name is required')
      }

      if (data.email && !isValidEmail(data.email)) {
        console.error('[Create Contact] Invalid email format:', data.email)
        throw new Error('Invalid email format')
      }

      if (data.phone && !isValidPhone(data.phone)) {
        console.error('[Create Contact] Invalid phone format:', data.phone)
        throw new Error('Invalid phone number format')
      }

      const validated = {
        name: sanitizeInput(data.name),
        phone: data.phone ? sanitizeInput(data.phone) : undefined,
        email: data.email ? data.email.toLowerCase().trim() : undefined,
        status: data.status || 'prospect',
        tags: data.tags || [],
      }
      
      console.log('[Create Contact] Validated body:', JSON.stringify(validated))
      return validated
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

    console.log('[Create Contact] Creating contact:', { 
      member_id: userId, 
      company_id: member.company_id, 
      name: body.name,
      status: body.status 
    })

    // Create contact - Updated to match actual schema
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        member_id: userId,
        company_id: member.company_id,
        name: body.name,
        phone: body.phone,
        email: body.email,
        status: body.status,
        tags: body.tags,
        notes: '',
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Contact] Database error:', error)
      throw error
    }

    console.log('[Create Contact] Contact created successfully:', contact.id)

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