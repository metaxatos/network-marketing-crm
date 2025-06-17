import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuthWithContext, validateBody } from '@/lib/api-helpers'
import type { UpdateEmailStatusRequest } from '@/types/api'

type RouteContext = { params: { id: string } }

// PUT /api/emails/[id]/status - Update email status
export const PUT = withAuthWithContext<any, RouteContext>(async (req, userId, { params }) => {
  try {
    const { id: emailId } = params
    if (!emailId) {
      return apiError('Email ID is required', 400)
    }

    const supabase = await createClient()
    
    // Verify email ownership
    const { data: email } = await supabase
      .from('sent_emails')
      .select('id, status')
      .eq('id', emailId)
      .eq('member_id', userId)
      .single()

    if (!email) {
      return apiError('Email not found', 404)
    }

    // Validate request body
    const body = await validateBody<UpdateEmailStatusRequest>(req, (data) => {
      if (!data.status || !['sent', 'failed', 'bounced'].includes(data.status)) {
        throw new Error('Valid status is required (sent, failed, or bounced)')
      }

      return {
        status: data.status,
      }
    })

    // Update email status
    const { data: updatedEmail, error } = await supabase
      .from('sent_emails')
      .update({
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', emailId)
      .eq('member_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return apiResponse({
      email: {
        id: updatedEmail.id,
        status: updatedEmail.status,
        updatedAt: updatedEmail.updated_at,
      },
    }, 200, 'Email status updated successfully')
  } catch (error) {
    console.error('Update email status error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to update email status',
      400
    )
  }
}) 