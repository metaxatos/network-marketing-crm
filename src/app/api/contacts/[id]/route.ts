import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuthWithContext, validateBody, sanitizeInput, isValidEmail, isValidPhone } from '@/lib/api-helpers'
import type { UpdateContactRequest } from '@/types/api'

type RouteContext = { params: { id: string } }

// GET /api/contacts/[id] - Get single contact
export const GET = withAuthWithContext<any, RouteContext>(async (req: NextRequest, userId: string, { params }) => {
  try {
    const { id: contactId } = params
    
    if (!contactId) {
      return apiError('Contact ID is required', 400)
    }

    const supabase = await createClient()
    const { data: contact, error } = await supabase
      .from('contacts')
      .select(`
          *,
          interactions:contact_interactions (
            id,
            interaction_type,
            notes,
            created_at
          )
        `)
      .eq('id', contactId)
      .eq('member_id', userId)
      .single()

    if (error) {
      console.error('Get contact error:', error)
      if (error.code === 'PGRST116') { // Not found
        return apiError('Contact not found', 404)
      }
      throw error
    }

    if (!contact) {
      return apiError('Contact not found', 404)
    }
    
    return apiResponse(contact, 200)

  } catch (error) {
    console.error('[GET CONTACT]', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to retrieve contact',
      500
    )
  }
})

// PUT /api/contacts/[id] - Update contact
export const PUT = withAuthWithContext<any, RouteContext>(async (req: NextRequest, userId: string, { params }) => {
  try {
    const { id: contactId } = params
    
    if (!contactId) {
      return apiError('Contact ID is required', 400)
    }

    const supabase = await createClient()

    // First, verify the contact belongs to the user
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', contactId)
      .eq('member_id', userId)
      .single()
    
    if (!existingContact) {
      return apiError('Contact not found or access denied', 404)
    }

    const body = await validateBody<UpdateContactRequest>(req, (data) => {
      const updates: Partial<UpdateContactRequest> = {}
      if (data.name) updates.name = sanitizeInput(data.name)
      if (data.email) {
        if (!isValidEmail(data.email)) throw new Error('Invalid email format')
        updates.email = data.email.toLowerCase().trim()
      }
      if (data.phone) {
        if (!isValidPhone(data.phone)) throw new Error('Invalid phone number format')
        updates.phone = sanitizeInput(data.phone)
      }
      if (data.status) updates.status = data.status
      if (data.notes) updates.notes = sanitizeInput(data.notes)
      if (data.avatar_url) updates.avatar_url = data.avatar_url
      if (data.last_contacted_at) updates.last_contacted_at = data.last_contacted_at

      return updates
    })

    if (Object.keys(body).length === 0) {
      return apiError('No update fields provided', 400)
    }

    const { data: updatedContact, error } = await supabase
      .from('contacts')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .eq('member_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Contact update error:', error)
      throw error
    }

    // Add an interaction record for the update
    if (body.status) {
      await supabase.from('contact_interactions').insert({
        contact_id: contactId,
        interaction_type: 'status_changed',
        metadata: { new_status: body.status },
        member_id: userId,
      })
    }

    return apiResponse(updatedContact, 200)

  } catch (error) {
    console.error('Update contact error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to update contact',
      400
    )
  }
})

// DELETE /api/contacts/[id] - Delete contact
export const DELETE = withAuthWithContext<any, RouteContext>(async (req: NextRequest, userId: string, { params }) => {
  try {
    const { id: contactId } = params
    
    if (!contactId) {
      return apiError('Contact ID is required', 400)
    }

    const supabase = await createClient()

    // First, verify the contact belongs to the user and get its name for logging
    const { data: contactToDelete } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('id', contactId)
      .eq('member_id', userId)
      .single()

    if (!contactToDelete) {
      return apiError('Contact not found or access denied', 404)
    }

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId)
      .eq('member_id', userId)

    if (error) {
      console.error('Delete contact error:', error)
      throw error
    }

    // Log the deletion
    await supabase.from('member_activities').insert({
      member_id: userId,
      activity_type: 'contact_deleted',
      metadata: { contact_id: contactId, contact_name: contactToDelete.name },
    })

    return apiResponse({ message: 'Contact deleted successfully' }, 200)

  } catch (error) {
    console.error('Delete contact error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to delete contact',
      500
    )
  }
}) 