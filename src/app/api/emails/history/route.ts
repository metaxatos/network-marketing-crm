import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, getPaginationParams } from '@/lib/api-helpers'
import type { EmailHistoryResponse } from '@/types/api'

// GET /api/emails/history - Get sent emails history
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    const { page = 1, limit = 20 } = getPaginationParams(req.nextUrl.searchParams)
    const offset = (page - 1) * limit

    // Get total count
    const { count: totalCount } = await supabase
      .from('sent_emails')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', userId)

    // Get sent emails with contact info
    const { data: emails, error } = await supabase
      .from('sent_emails')
      .select(`
        id,
        subject,
        status,
        sent_at,
        opened_at,
        clicked_at,
        contact:contacts!inner (
          id,
          name
        )
      `)
      .eq('member_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    const response: EmailHistoryResponse = {
      emails: emails?.map(email => ({
        id: email.id,
        contactName: email.contact?.[0]?.name || 'Unknown',
        subject: email.subject,
        status: email.status,
        sentAt: email.sent_at,
        openedAt: email.opened_at,
      })) || [],
    }

    return apiResponse({
      ...response,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        hasMore: offset + limit < (totalCount || 0),
      },
    }, 200)
  } catch (error) {
    console.error('Email history error:', error)
    return apiError('Failed to retrieve email history', 500)
  }
}) 