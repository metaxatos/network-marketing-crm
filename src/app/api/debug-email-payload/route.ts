import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const headers = Object.fromEntries(req.headers.entries())
    
    console.log('🔍 [DEBUG] Email payload received:', {
      timestamp: new Date().toISOString(),
      body,
      headers: {
        'content-type': headers['content-type'],
        'user-agent': headers['user-agent'],
        'authorization': headers['authorization'] ? 'Present' : 'Missing',
        'cookie': headers['cookie'] ? 'Present' : 'Missing'
      }
    })
    
    // Return everything for debugging
    return apiResponse({
      message: 'Email payload captured for debugging',
      received_data: body,
      data_types: {
        templateId: typeof body.templateId,
        contactIds: typeof body.contactIds,
        contactIds_length: Array.isArray(body.contactIds) ? body.contactIds.length : 'not array',
        customSubject: typeof body.customSubject,
        customContent: typeof body.customContent,
        to: typeof body.to
      },
      analysis: {
        has_template: !!body.templateId,
        has_contacts: Array.isArray(body.contactIds) && body.contactIds.length > 0,
        has_direct_emails: Array.isArray(body.to) && body.to.length > 0,
        should_work: (!!body.templateId || !!body.customContent) && 
                     ((Array.isArray(body.contactIds) && body.contactIds.length > 0) || 
                      (Array.isArray(body.to) && body.to.length > 0))
      }
    })
  } catch (error) {
    console.error('🔍 [DEBUG] Error processing email payload:', error)
    return apiResponse({
      error: 'Failed to process debug request',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 