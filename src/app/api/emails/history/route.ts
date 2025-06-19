import { NextRequest } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { apiResponse, apiError, getCurrentMember } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createApiClient(req)
    const { searchParams } = new URL(req.url)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return apiError('Authentication required', 401)
    }

    // Get member data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, company_id, status')
      .eq('id', user.id)
      .single()

    if (memberError || !member) {
      return apiError('Member profile not found', 404)
    }

    console.log('[Email History API] Fetching email history for member:', member.id)

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const status = searchParams.get('status')
    const offset = (page - 1) * limit

    // Build query for communications table (NEW: emails stored here instead of sent_emails)
    let query = supabase
      .from('communications')
      .select(`
        id,
        contact_id,
        type,
        subject,
        content,
        status,
        sent_at,
        created_at,
        metadata
      `)
      .eq('member_id', member.id)
      .eq('type', 'email') // Only get email communications
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by status if provided
    if (status && ['pending', 'sent', 'delivered', 'opened', 'clicked', 'failed'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: communications, error: historyError } = await query

    if (historyError) {
      console.error('[Email History API] Query error:', historyError)
      return apiError('Failed to fetch email history', 500)
    }

    // Get contact info for communications that have contact_id
    const contactIds = communications?.filter(c => c.contact_id).map(c => c.contact_id) || []
    let contactsData: Record<string, any> = {}
    
    if (contactIds.length > 0) {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name, email')
        .in('id', contactIds)
      
      if (contacts) {
        contactsData = contacts.reduce((acc, contact) => {
          acc[contact.id] = contact
          return acc
        }, {} as Record<string, any>)
      }
    }

    // Transform communications data to match EmailHistory interface
    const emailHistory = communications?.map(comm => ({
      id: comm.id,
      member_id: member.id,
      subject: comm.subject || 'No Subject',
      status: comm.status,
      recipient_count: comm.contact_id ? 1 : (comm.metadata?.recipient_count || 0),
      sent_at: comm.sent_at || comm.created_at,
      template_id: comm.metadata?.template_id || null,
      contact: comm.contact_id && contactsData[comm.contact_id] ? {
        id: contactsData[comm.contact_id].id,
        name: contactsData[comm.contact_id].name,
        email: contactsData[comm.contact_id].email
      } : null,
      // Email tracking data from metadata
      opened_at: comm.metadata?.opened_at || null,
      clicked_at: comm.metadata?.clicked_at || null,
      clicks_count: comm.metadata?.clicks_count || 0,
    })) || []

    // Get total count for pagination
    let totalQuery = supabase
      .from('communications')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', member.id)
      .eq('type', 'email')

    if (status) {
      totalQuery = totalQuery.eq('status', status)
    }

    const { count: totalCount } = await totalQuery

    console.log(`[Email History API] Found ${emailHistory.length} emails (total: ${totalCount})`)

    return apiResponse({
      emails: emailHistory,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        has_more: (offset + emailHistory.length) < (totalCount || 0),
        next_cursor: emailHistory.length === limit ? emailHistory[emailHistory.length - 1]?.id : undefined
      }
    })

  } catch (error) {
    console.error('[Email History API] Unexpected error:', error)
    return apiError('Internal server error', 500)
  }
} 