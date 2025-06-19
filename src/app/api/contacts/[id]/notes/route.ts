import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuthWithContext, validateBody, sanitizeInput } from '@/lib/api-helpers'

// Define simplified note request (no separate table needed)
interface AddNoteRequest {
  content: string
}

// POST /api/contacts/[id]/notes - Add note to contact (stored inline in contacts.notes)
export const POST = withAuthWithContext(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const { id: contactId } = params
    
    if (!contactId) {
      return apiError('Contact ID is required', 400)
    }

    const supabase = await createClient()
    
    // Get contact with existing notes
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, name, notes')
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

    // Create new note object
    const newNote = {
      id: crypto.randomUUID(),
      content: body.content,
      created_at: new Date().toISOString(),
      created_by: userId,
    }

    // Append to existing notes array (or create new array)
    const existingNotes = contact.notes || []
    const updatedNotes = [...existingNotes, newNote]

    // Update contact with new notes array
    const { data: updatedContact, error } = await supabase
      .from('contacts')
      .update({
        notes: updatedNotes,
        last_contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .eq('member_id', userId)
      .select('notes')
      .single()

    if (error) {
      throw error
    }

    // Log interaction in communications table (replaces contact_interactions)
    try {
      await supabase.from('communications').insert({
        member_id: userId,
        contact_id: contactId,
        type: 'note',
        subject: `Note added to ${contact.name}`,
        content: body.content,
        metadata: {
          interaction_type: 'note_added',
          note_id: newNote.id,
          note_preview: body.content.substring(0, 100),
        },
      })
    } catch (logError) {
      console.warn('Failed to log note interaction:', logError)
      // Don't fail the request if logging fails
    }

    return apiResponse({
      note: {
        id: newNote.id,
        content: newNote.content,
        createdAt: newNote.created_at,
      },
      totalNotes: updatedNotes.length,
    }, 201, 'Note added successfully')
  } catch (error) {
    console.error('Add note error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to add note',
      400
    )
  }
})

// GET /api/contacts/[id]/notes - Get all notes for contact (from inline storage)
export const GET = withAuthWithContext(async (req: NextRequest, userId: string, { params }: { params: { id: string } }) => {
  try {
    const { id: contactId } = params
    
    if (!contactId) {
      return apiError('Contact ID is required', 400)
    }

    const supabase = await createClient()
    
    // Get contact with notes
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, name, notes')
      .eq('id', contactId)
      .eq('member_id', userId)
      .single()

    if (!contact) {
      return apiError('Contact not found', 404)
    }

    const notes = contact.notes || []

    return apiResponse({
      notes: notes.map((note: any) => ({
        id: note.id,
        content: note.content,
        createdAt: note.created_at,
        createdBy: note.created_by,
      })),
      totalNotes: notes.length,
    }, 200)
  } catch (error) {
    console.error('Get notes error:', error)
    return apiError('Failed to retrieve notes', 500)
  }
}) 