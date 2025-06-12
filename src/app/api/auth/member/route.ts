import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody, sanitizeInput } from '@/lib/api-helpers'

interface UpdateMemberRequest {
  email?: string
  phone?: string
  username?: string
  name?: string
}

// PATCH /api/auth/member - Update member information
export const PATCH = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    // Validate request body
    const body = await validateBody<UpdateMemberRequest>(req, (data) => {
      const updates: UpdateMemberRequest = {}
      
      if (data.email !== undefined) {
        const email = data.email.toLowerCase().trim()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format')
        }
        updates.email = email
      }
      
      if (data.phone !== undefined) {
        const phone = sanitizeInput(data.phone)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        if (phone && !phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
          throw new Error('Invalid phone number format')
        }
        updates.phone = phone
      }
      
      if (data.username !== undefined) {
        const username = data.username.toLowerCase().trim()
        const usernameRegex = /^[a-z0-9_-]+$/
        if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
          throw new Error('Username must be 3-30 characters, lowercase letters, numbers, hyphens, and underscores only')
        }
        updates.username = username
      }
      
      if (data.name !== undefined) {
        updates.name = sanitizeInput(data.name)
      }

      return updates
    })

    // Check if username is already taken (if updating username)
    if (body.username) {
      const { data: existingUsername } = await supabase
        .from('members')
        .select('id')
        .eq('username', body.username)
        .neq('id', userId) // Exclude current user
        .single()

      if (existingUsername) {
        return apiError('Username is already taken', 400)
      }
    }

    // Update member record
    const { data: updatedMember, error } = await supabase
      .from('members')
      .update(body)
      .eq('id', userId)
      .select('id, email, company_id, username, name, avatar_url, phone, status, level, sponsor_id, created_at')
      .single()

    if (error) {
      console.error('Member update error:', error)
      throw error
    }

    // Log activity
    try {
      await supabase.from('member_activities').insert({
        member_id: userId,
        activity_type: 'profile_updated',
        metadata: {
          updated_fields: Object.keys(body),
        },
      })
    } catch (err) {
      console.warn('Activity logging failed:', err)
    }

    return apiResponse({
      member: updatedMember,
      message: 'Member information updated successfully'
    }, 200)

  } catch (error) {
    console.error('Update member error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to update member information',
      400
    )
  }
}) 