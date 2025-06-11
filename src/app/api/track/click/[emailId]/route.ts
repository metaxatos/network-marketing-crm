import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  isValidRedirectUrl, 
  getClientIp, 
  anonymizeIp,
  parseTrackingUrl 
} from '@/lib/email-tracking'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ emailId: string }> }
) {
  try {
    const { emailId } = await params
    const url = request.nextUrl
    
    // Extract tracking parameters
    const originalUrl = url.searchParams.get('url')
    const linkId = url.searchParams.get('linkId')
    const contactId = url.searchParams.get('contactId')
    
    // Validate required parameters
    if (!emailId || !originalUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    // Validate the redirect URL for security
    if (!isValidRedirectUrl(originalUrl)) {
      return NextResponse.json(
        { error: 'Invalid redirect URL' },
        { status: 400 }
      )
    }
    
    // Get client information
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''
    
    // Verify the email exists and get related data
    const { data: emailData, error: emailError } = await supabase
      .from('sent_emails')
      .select('id, contact_id, member_id')
      .eq('id', emailId)
      .single()
    
    if (emailError || !emailData) {
      console.error('Email not found:', emailError)
      // Still redirect to avoid broken user experience
      return NextResponse.redirect(originalUrl, 302)
    }
    
    // Use contact_id from URL params or fall back to email's contact_id
    const finalContactId = contactId || emailData.contact_id
    
    // Parse link position from linkId
    const linkPosition = linkId ? parseInt(linkId.replace('link-', '')) || null : null
    
    // Log the click in the database
    try {
      const { error: insertError } = await supabase
        .from('email_clicks')
        .insert({
          email_id: emailId,
          contact_id: finalContactId,
          url: originalUrl,
          link_position: linkPosition,
          ip_address: anonymizeIp(clientIp),
          user_agent: userAgent,
          referrer: referrer,
          clicked_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('Failed to log click:', insertError)
        // Continue with redirect even if logging fails
      }
      
      // Update email click statistics
      await updateEmailClickStats(emailId)
      
      // Update contact last interaction
      if (finalContactId) {
        await updateContactLastInteraction(finalContactId)
      }
      
      // Log activity for the member
      await logMemberActivity(emailData.member_id, 'email_clicked', {
        email_id: emailId,
        contact_id: finalContactId,
        url: originalUrl,
        link_position: linkPosition
      })
      
    } catch (dbError) {
      console.error('Database error while logging click:', dbError)
      // Continue with redirect even if database operations fail
    }
    
    // Redirect to the original URL
    return NextResponse.redirect(originalUrl, 302)
    
  } catch (error) {
    console.error('Click tracking error:', error)
    
    // Try to extract original URL for emergency redirect
    const originalUrl = request.nextUrl.searchParams.get('url')
    if (originalUrl && isValidRedirectUrl(originalUrl)) {
      return NextResponse.redirect(originalUrl, 302)
    }
    
    // Fallback error page
    return NextResponse.json(
      { error: 'Tracking failed' },
      { status: 500 }
    )
  }
}

/**
 * Updates click statistics for the email
 */
async function updateEmailClickStats(emailId: string) {
  try {
    // Get current click count
    const { data: clickData } = await supabase
      .from('email_clicks')
      .select('id, contact_id')
      .eq('email_id', emailId)
    
    if (!clickData) return
    
    const totalClicks = clickData.length
    const uniqueClicks = new Set(clickData.map((c: { contact_id: string | null }) => c.contact_id).filter(Boolean)).size
    
    // Calculate click-through rate (if we have this data)
    // For now, we'll just update the total clicks
    await supabase
      .from('sent_emails')
      .update({ 
        total_clicks: totalClicks,
        clicked_at: new Date().toISOString()
      })
      .eq('id', emailId)
      
  } catch (error) {
    console.error('Failed to update email click stats:', error)
  }
}

/**
 * Updates the contact's last interaction timestamp
 */
async function updateContactLastInteraction(contactId: string) {
  try {
    await supabase
      .from('contacts')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', contactId)
  } catch (error) {
    console.error('Failed to update contact interaction:', error)
  }
}

/**
 * Logs member activity for click tracking
 */
async function logMemberActivity(
  memberId: string, 
  activityType: string, 
  metadata: Record<string, any>
) {
  try {
    await supabase
      .from('member_activities')
      .insert({
        member_id: memberId,
        activity_type: activityType,
        metadata: metadata
      })
  } catch (error) {
    console.error('Failed to log member activity:', error)
  }
} 
