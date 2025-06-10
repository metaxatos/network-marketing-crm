import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody, sanitizeInput } from '@/lib/api-helpers'
import type { AddNoteRequest } from '@/types/api'

// POST /api/contacts/[id]/notes - Add note to contact
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const pathParts = req.nextUrl.pathname.split('/')
    const contactId = pathParts[pathParts.length - 2] // Get contact ID from path
    
    if (!contactId) {
      return apiError('Contact ID is required', 400)
    }

    const supabase = await createClient()
    
    // Verify contact ownership
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('id', contactId)
      .eq('member_id', userId)
      .single()

    if (!contact) {
      return apiError('Contact not found', 404)
    }

    // Validate request body
    const body = await validateBody<AddNoteRequest>(req, (data) => {
      if (!data.content || data.content.trim().length === 0) {
        throw new Error('Note content is required')
      }

      return {
        content: sanitizeInput(data.content),
      }
    })

    // Create note
    const { data: note, error } = await supabase
      .from('contact_notes')
      .insert({
        contact_id: contactId,
        member_id: userId,
        content: body.content,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update last contacted date
    await supabase
      .from('contacts')
      .update({
        last_contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .eq('member_id', userId)

    // Log interaction
    await supabase.from('contact_interactions').insert({
      contact_id: contactId,
      interaction_type: 'note_added',
      metadata: {
        note_id: note.id,
        note_preview: body.content.substring(0, 100),
      },
    })

    // Log activity
    await supabase.from('member_activities').insert({
      member_id: userId,
      activity_type: 'note_added',
      metadata: {
        contact_id: contactId,
        contact_name: contact.name,
        note_preview: body.content.substring(0, 50),
      },
    })

    return apiResponse({
      note: {
        id: note.id,
        content: note.content,
        createdAt: note.created_at,
      },
    }, 201, 'Note added successfully')
  } catch (error) {
    console.error('Add note error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to add note',
      400
    )
  }
}) 