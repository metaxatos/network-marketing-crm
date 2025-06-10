import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody, sanitizeInput, isValidEmail, isValidPhone } from '@/lib/api-helpers'
import type { UpdateContactRequest } from '@/types/api'

// GET /api/contacts/[id] - Get single contact
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop()
    
    if (!id) {
      return apiError('Contact ID is required', 400)
    }

    const supabase = await createClient()
    
    // Get contact with notes
    const { data: contact, error } = await supabase
      .from('contacts')
      .select(`
        *,
        contact_notes (
          id,
          content,
          created_at
        ),
        contact_interactions (
          id,
          interaction_type,
          metadata,
          created_at
        )
      `)
      .eq('id', id)
      .eq('member_id', userId)
      .single()

    if (error || !contact) {
      return apiError('Contact not found', 404)
    }

    return apiResponse({
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        status: contact.status,
        tags: contact.tags,
        customFields: contact.custom_fields,
        lastContactedAt: contact.last_contacted_at,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at,
        notes: contact.contact_notes || [],
        interactions: contact.contact_interactions || [],
      },
    }, 200)
  } catch (error) {
    console.error('Get contact error:', error)
    return apiError('Failed to retrieve contact', 500)
  }
})

// PUT /api/contacts/[id] - Update contact
export const PUT = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop()
    
    if (!id) {
      return apiError('Contact ID is required', 400)
    }

    const supabase = await createClient()
    
    // Verify contact ownership
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', id)
      .eq('member_id', userId)
      .single()

    if (!existing) {
      return apiError('Contact not found', 404)
    }

    // Validate request body
    const body = await validateBody<UpdateContactRequest>(req, (data) => {
      if (data.email && !isValidEmail(data.email)) {
        throw new Error('Invalid email format')
      }

      if (data.phone && !isValidPhone(data.phone)) {
        throw new Error('Invalid phone number format')
      }

      const updates: UpdateContactRequest = {}
      
      if (data.name !== undefined) updates.name = sanitizeInput(data.name)
      if (data.phone !== undefined) updates.phone = sanitizeInput(data.phone)
      if (data.email !== undefined) updates.email = data.email.toLowerCase().trim()
      if (data.status !== undefined) updates.status = data.status
      if (data.tags !== undefined) updates.tags = data.tags

      return updates
    })

    // Update contact
    const { data: contact, error } = await supabase
      .from('contacts')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('member_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log interaction if status changed
    if (body.status) {
      await supabase.from('contact_interactions').insert({
        contact_id: id,
        interaction_type: 'status_changed',
        metadata: {
          new_status: body.status,
        },
      })
    }

    return apiResponse({
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        status: contact.status,
        tags: contact.tags,
        updatedAt: contact.updated_at,
      },
    }, 200, 'Contact updated successfully')
  } catch (error) {
    console.error('Update contact error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to update contact',
      400
    )
  }
})

// DELETE /api/contacts/[id] - Delete contact
export const DELETE = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop()
    
    if (!id) {
      return apiError('Contact ID is required', 400)
    }

    const supabase = await createClient()
    
    // Verify contact ownership
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('id', id)
      .eq('member_id', userId)
      .single()

    if (!existing) {
      return apiError('Contact not found', 404)
    }

    // Delete contact (cascade will handle related records)
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('member_id', userId)

    if (error) {
      throw error
    }

    // Log activity
    await supabase.from('member_activities').insert({
      member_id: userId,
      activity_type: 'contact_deleted',
      metadata: {
        contact_name: existing.name,
      },
    })

    return apiResponse(
      { message: 'Contact deleted successfully' },
      200,
      'Contact deleted successfully'
    )
  } catch (error) {
    console.error('Delete contact error:', error)
    return apiError('Failed to delete contact', 500)
  }
}) 