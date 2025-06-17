import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'
import type { EmailClickAnalytics, ClickMetrics } from '@/types/email-tracking'

// GET /api/emails/analytics - Get email click analytics
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
      // Get click history for contact
      const history = await getContactClickHistory(supabase, contactId, userId)
      return apiResponse({ type: 'contact', data: history })
    }
    
    // Get overall click metrics
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
): Promise<EmailClickAnalytics | null> {
  // Get email details
  const { data: email, error: emailError } = await supabase
    .from('sent_emails')
    .select(`
      id,
      subject,
      sent_at,
      total_clicks,
      template_id,
      email_templates(name)
    `)
    .eq('id', emailId)
    .eq('member_id', userId)
    .single()
  
  if (emailError || !email) {
    throw new Error('Email not found')
  }
  
  // Get all clicks for this email
  const { data: clicks, error: clicksError } = await supabase
    .from('email_clicks')
    .select(`
      id,
      contact_id,
      url,
      link_position,
      clicked_at,
      ip_address,
      user_agent,
      referrer,
      contacts(name)
    `)
    .eq('email_id', emailId)
    .order('clicked_at', { ascending: false })
  
  if (clicksError) {
    throw new Error('Failed to get click data')
  }
  
  const uniqueClicks = new Set(clicks?.map((c: any) => c.contact_id).filter(Boolean)).size || 0
  const totalClicks = clicks?.length || 0
  
  return {
    email_id: emailId,
    template_id: email.template_id,
    template_name: email.email_templates?.name,
    subject: email.subject,
    sent_at: email.sent_at,
    total_clicks: totalClicks,
    unique_clicks: uniqueClicks,
    click_through_rate: totalClicks > 0 ? (uniqueClicks / totalClicks) : 0,
    clicks: clicks || []
  }
}

async function getTemplateAnalytics(
  supabase: any,
  templateId: string,
  userId: string,
  fromDate: Date
): Promise<EmailClickAnalytics[]> {
  // Get all emails sent with this template
  const { data: emails, error: emailsError } = await supabase
    .from('sent_emails')
    .select(`
      id,
      subject,
      sent_at,
      total_clicks,
      email_templates(name)
    `)
    .eq('template_id', templateId)
    .eq('member_id', userId)
    .gte('sent_at', fromDate.toISOString())
    .order('sent_at', { ascending: false })
  
  if (emailsError) {
    throw new Error('Failed to get template emails')
  }
  
  const analytics: EmailClickAnalytics[] = []
  
  for (const email of emails || []) {
    const { data: clicks } = await supabase
      .from('email_clicks')
      .select('id, contact_id, url, clicked_at')
      .eq('email_id', email.id)
    
    const uniqueClicks = new Set(clicks?.map((c: any) => c.contact_id).filter(Boolean)).size || 0
    const totalClicks = clicks?.length || 0
    
    analytics.push({
      email_id: email.id,
      template_id: templateId,
      template_name: email.email_templates?.name,
      subject: email.subject,
      sent_at: email.sent_at,
      total_clicks: totalClicks,
      unique_clicks: uniqueClicks,
      click_through_rate: totalClicks > 0 ? (uniqueClicks / totalClicks) : 0,
      clicks: clicks || []
    })
  }
  
  return analytics
}

async function getContactClickHistory(
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
  
  // Get all clicks by this contact
  const { data: clicks, error: clicksError } = await supabase
    .from('email_clicks')
    .select(`
      id,
      email_id,
      url,
      clicked_at,
      sent_emails(subject, sent_at)
    `)
    .eq('contact_id', contactId)
    .order('clicked_at', { ascending: false })
  
  if (clicksError) {
    throw new Error('Failed to get click history')
  }
  
  // Group clicks by email
  const emailClicks = new Map()
  
  clicks?.forEach((click: any) => {
    const emailId = click.email_id
    if (!emailClicks.has(emailId)) {
      emailClicks.set(emailId, {
        email_id: emailId,
        subject: click.sent_emails?.subject,
        sent_at: click.sent_emails?.sent_at,
        click_count: 0,
        last_clicked_at: click.clicked_at
      })
    }
    
    const emailData = emailClicks.get(emailId)
    emailData.click_count++
    if (click.clicked_at > emailData.last_clicked_at) {
      emailData.last_clicked_at = click.clicked_at
    }
  })
  
  return {
    contact_id: contactId,
    contact_name: contact.name,
    total_clicks: clicks?.length || 0,
    last_clicked_at: clicks?.[0]?.clicked_at,
    emails_clicked: Array.from(emailClicks.values())
  }
}

async function getOverallMetrics(
  supabase: any,
  userId: string,
  fromDate: Date,
  limit: number
): Promise<ClickMetrics> {
  // Get all clicks for user's emails in date range
  const { data: clicks, error: clicksError } = await supabase
    .from('email_clicks')
    .select(`
      id,
      contact_id,
      url,
      clicked_at,
      email_id,
      sent_emails!inner(member_id)
    `)
    .eq('sent_emails.member_id', userId)
    .gte('clicked_at', fromDate.toISOString())
    .order('clicked_at', { ascending: false })
    .limit(limit)
  
  if (clicksError) {
    throw new Error('Failed to get click metrics')
  }
  
  const totalClicks = clicks?.length || 0
  const uniqueClicks = new Set(clicks?.map((c: any) => c.contact_id).filter(Boolean)).size || 0
  
  // Count clicks by URL
  const urlCounts = new Map()
  clicks?.forEach((click: any) => {
    const count = urlCounts.get(click.url) || { click_count: 0, unique_clicks: new Set() }
    count.click_count++
    if (click.contact_id) {
      count.unique_clicks.add(click.contact_id)
    }
    urlCounts.set(click.url, count)
  })
  
  const mostClickedLinks = Array.from(urlCounts.entries())
    .map(([url, data]) => ({
      url,
      click_count: data.click_count,
      unique_clicks: data.unique_clicks.size
    }))
    .sort((a, b) => b.click_count - a.click_count)
    .slice(0, 10)
  
  // Create time series data (daily)
  const timeSeriesMap = new Map()
  clicks?.forEach((click: any) => {
    const date = new Date(click.clicked_at).toISOString().split('T')[0]
    const data = timeSeriesMap.get(date) || { clicks: 0, unique_clicks: new Set() }
    data.clicks++
    if (click.contact_id) {
      data.unique_clicks.add(click.contact_id)
    }
    timeSeriesMap.set(date, data)
  })
  
  const timeSeries = Array.from(timeSeriesMap.entries())
    .map(([date, data]) => ({
      date,
      clicks: data.clicks,
      unique_clicks: data.unique_clicks.size
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
  
  return {
    total_clicks: totalClicks,
    unique_clicks: uniqueClicks,
    click_through_rate: totalClicks > 0 ? (uniqueClicks / totalClicks) : 0,
    most_clicked_links: mostClickedLinks,
    time_series: timeSeries
  }
} 