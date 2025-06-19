import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'

// Simplified analytics types for new schema
interface EmailAnalytics {
  email_id: string
  template_id?: string
  template_name?: string
  subject: string
  sent_at: string
  total_clicks: number
  unique_clicks: number
  click_through_rate: number
  clicks: any[]
}

interface ClickMetrics {
  total_emails_sent: number
  total_clicks: number
  unique_contacts_clicked: number
  average_ctr: number
  top_clicked_links: any[]
  recent_activity: any[]
}

// GET /api/emails/analytics - Get email analytics (using communications table)
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    const url = new URL(req.url)
    
    const emailId = url.searchParams.get('emailId')
    const templateId = url.searchParams.get('templateId')
    const contactId = url.searchParams.get('contactId')
    const days = parseInt(url.searchParams.get('days') || '30')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    // Date range filter
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)
    
    if (emailId) {
      // Get analytics for specific email
      const analytics = await getEmailAnalytics(supabase, emailId, userId)
      return apiResponse({ type: 'email', data: analytics })
    }
    
    if (templateId) {
      // Get analytics for template
      const analytics = await getTemplateAnalytics(supabase, templateId, userId, fromDate)
      return apiResponse({ type: 'template', data: analytics })
    }
    
    if (contactId) {
      // Get interaction history for contact
      const history = await getContactInteractionHistory(supabase, contactId, userId)
      return apiResponse({ type: 'contact', data: history })
    }
    
    // Get overall email metrics
    const metrics = await getOverallMetrics(supabase, userId, fromDate, limit)
    return apiResponse({ type: 'metrics', data: metrics })
    
  } catch (error) {
    console.error('Analytics error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to get analytics',
      500
    )
  }
})

async function getEmailAnalytics(
  supabase: any,
  emailId: string,
  userId: string
): Promise<EmailAnalytics | null> {
  // Get email communication record
  const { data: email, error: emailError } = await supabase
    .from('communications')
    .select(`
      id,
      subject,
      content,
      template_id,
      created_at,
      metadata,
      email_templates(name)
    `)
    .eq('id', emailId)
    .eq('member_id', userId)
    .eq('type', 'email')
    .single()
  
  if (emailError || !email) {
    throw new Error('Email not found')
  }
  
  // Extract click data from metadata
  const clickData = email.metadata?.clicks || []
  const totalClicks = clickData.length
  const uniqueClicks = new Set(clickData.map((c: any) => c.contact_id).filter(Boolean)).size
  
  return {
    email_id: emailId,
    template_id: email.template_id,
    template_name: email.email_templates?.name,
    subject: email.subject,
    sent_at: email.created_at,
    total_clicks: totalClicks,
    unique_clicks: uniqueClicks,
    click_through_rate: totalClicks > 0 ? (uniqueClicks / totalClicks) : 0,
    clicks: clickData || []
  }
}

async function getTemplateAnalytics(
  supabase: any,
  templateId: string,
  userId: string,
  fromDate: Date
): Promise<EmailAnalytics[]> {
  // Get all emails sent with this template
  const { data: emails, error: emailsError } = await supabase
    .from('communications')
    .select(`
      id,
      subject,
      created_at,
      metadata,
      email_templates(name)
    `)
    .eq('template_id', templateId)
    .eq('member_id', userId)
    .eq('type', 'email')
    .gte('created_at', fromDate.toISOString())
    .order('created_at', { ascending: false })
  
  if (emailsError) {
    throw new Error('Failed to get template emails')
  }
  
  const analytics: EmailAnalytics[] = []
  
  for (const email of emails || []) {
    const clickData = email.metadata?.clicks || []
    const totalClicks = clickData.length
    const uniqueClicks = new Set(clickData.map((c: any) => c.contact_id).filter(Boolean)).size
    
    analytics.push({
      email_id: email.id,
      template_id: templateId,
      template_name: email.email_templates?.name,
      subject: email.subject,
      sent_at: email.created_at,
      total_clicks: totalClicks,
      unique_clicks: uniqueClicks,
      click_through_rate: totalClicks > 0 ? (uniqueClicks / totalClicks) : 0,
      clicks: clickData || []
    })
  }
  
  return analytics
}

async function getContactInteractionHistory(
  supabase: any,
  contactId: string,
  userId: string
): Promise<any> {
  // Verify contact belongs to user
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('id, name')
    .eq('id', contactId)
    .eq('member_id', userId)
    .single()
  
  if (contactError || !contact) {
    throw new Error('Contact not found')
  }
  
  // Get all communications with this contact
  const { data: interactions, error: interactionsError } = await supabase
    .from('communications')
    .select(`
      id,
      type,
      subject,
      content,
      created_at,
      metadata
    `)
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })
  
  if (interactionsError) {
    throw new Error('Failed to get interaction history')
  }
  
  // Extract click history from email interactions
  const clickHistory = []
  for (const interaction of interactions || []) {
    if (interaction.type === 'email' && interaction.metadata?.clicks) {
      for (const click of interaction.metadata.clicks) {
        clickHistory.push({
          communication_id: interaction.id,
          subject: interaction.subject,
          url: click.url,
          clicked_at: click.clicked_at,
          email_sent_at: interaction.created_at,
        })
      }
    }
  }
  
  return {
    contact_id: contactId,
    contact_name: contact.name,
    total_interactions: interactions?.length || 0,
    total_clicks: clickHistory.length,
    interactions: interactions || [],
    click_history: clickHistory,
  }
}

async function getOverallMetrics(
  supabase: any,
  userId: string,
  fromDate: Date,
  limit: number
): Promise<ClickMetrics> {
  // Get all email communications in date range
  const { data: emails, error: emailsError } = await supabase
    .from('communications')
    .select('id, subject, created_at, metadata, contact_id')
    .eq('member_id', userId)
    .eq('type', 'email')
    .gte('created_at', fromDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (emailsError) {
    throw new Error('Failed to get email metrics')
  }
  
  // Calculate metrics from email metadata
  let totalClicks = 0
  const contactsWhoClicked = new Set()
  const linkClickCounts: { [url: string]: number } = {}
  const recentActivity = []
  
  for (const email of emails || []) {
    const clicks = email.metadata?.clicks || []
    totalClicks += clicks.length
    
    for (const click of clicks) {
      if (click.contact_id) {
        contactsWhoClicked.add(click.contact_id)
      }
      if (click.url) {
        linkClickCounts[click.url] = (linkClickCounts[click.url] || 0) + 1
      }
      
      recentActivity.push({
        type: 'click',
        email_id: email.id,
        email_subject: email.subject,
        url: click.url,
        clicked_at: click.clicked_at,
        contact_id: click.contact_id,
      })
    }
  }
  
  // Sort recent activity by date
  recentActivity.sort((a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
  
  // Get top clicked links
  const topClickedLinks = Object.entries(linkClickCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([url, count]) => ({ url, clicks: count }))
  
  const totalEmailsSent = emails?.length || 0
  const uniqueContactsClicked = contactsWhoClicked.size
  const averageCtr = totalEmailsSent > 0 ? (totalClicks / totalEmailsSent) : 0
  
  return {
    total_emails_sent: totalEmailsSent,
    total_clicks: totalClicks,
    unique_contacts_clicked: uniqueContactsClicked,
    average_ctr: Math.round(averageCtr * 100) / 100,
    top_clicked_links: topClickedLinks,
    recent_activity: recentActivity.slice(0, 20), // Limit recent activity
  }
} 