import type { LinkTrackingResult, TrackingLinkData } from '@/types/email-tracking'

/**
 * Creates a tracking URL for email click tracking
 */
export function createTrackingUrl(data: TrackingLinkData): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const params = new URLSearchParams()
  
  params.set('url', data.url)
  if (data.link_id) params.set('linkId', data.link_id)
  if (data.contact_id) params.set('contactId', data.contact_id)
  
  return `${baseUrl}/api/track/click/${data.email_id}?${params.toString()}`
}

/**
 * Extracts all URLs from text using regex
 */
function extractUrlsFromText(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"'()]+/gi
  return text.match(urlRegex) || []
}

/**
 * Wraps URLs in plain text with tracking links
 */
export function wrapTextLinks(text: string, emailId: string, contactId?: string): LinkTrackingResult {
  const urls = extractUrlsFromText(text)
  let wrappedText = text
  let wrappedCount = 0
  
  urls.forEach((url, index) => {
    // Skip if already a tracking URL
    if (url.includes('/api/track/click/')) {
      return
    }
    
    const trackingUrl = createTrackingUrl({
      email_id: emailId,
      url: url,
      link_id: `link-${index + 1}`,
      contact_id: contactId
    })
    
    // Replace the original URL with tracking URL
    wrappedText = wrappedText.replace(url, trackingUrl)
    wrappedCount++
  })
  
  return {
    text: wrappedText,
    total_links: urls.length,
    wrapped_links: wrappedCount,
    html: '' // Not applicable for text
  }
}

/**
 * Wraps all links in HTML content with tracking URLs
 */
export function wrapHtmlLinks(html: string, emailId: string, contactId?: string): LinkTrackingResult {
  // Regular expression to match href attributes in anchor tags
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi
  
  let wrappedHtml = html
  let totalLinks = 0
  let wrappedCount = 0
  const processedUrls = new Set<string>()
  
  let match
  while ((match = linkRegex.exec(html)) !== null) {
    const fullMatch = match[0]
    const originalUrl = match[1]
    const linkText = match[2]
    
    totalLinks++
    
    // Skip if already a tracking URL or special URLs
    if (originalUrl.includes('/api/track/click/') ||
        originalUrl.startsWith('mailto:') ||
        originalUrl.startsWith('tel:') ||
        originalUrl.startsWith('#') ||
        originalUrl.startsWith('javascript:')) {
      continue
    }
    
    // Skip duplicates in the same email
    const urlKey = `${originalUrl}-${linkText}`
    if (processedUrls.has(urlKey)) {
      continue
    }
    processedUrls.add(urlKey)
    
    const trackingUrl = createTrackingUrl({
      email_id: emailId,
      url: originalUrl,
      link_id: `link-${totalLinks}`,
      contact_id: contactId
    })
    
    // Create new anchor tag with tracking URL
    const newLink = fullMatch.replace(
      originalUrl,
      trackingUrl
    )
    
    wrappedHtml = wrappedHtml.replace(fullMatch, newLink)
    wrappedCount++
  }
  
  return {
    html: wrappedHtml,
    total_links: totalLinks,
    wrapped_links: wrappedCount,
    text: '' // Not applicable for HTML
  }
}

/**
 * Main function to wrap all links in an email with tracking
 */
export function wrapEmailLinks(
  htmlContent: string,
  textContent: string | null,
  emailId: string,
  contactId?: string
): LinkTrackingResult {
  const htmlResult = wrapHtmlLinks(htmlContent, emailId, contactId)
  
  let textResult: LinkTrackingResult | null = null
  if (textContent) {
    textResult = wrapTextLinks(textContent, emailId, contactId)
  }
  
  return {
    html: htmlResult.html,
    text: textResult?.text || textContent || '',
    total_links: htmlResult.total_links + (textResult?.total_links || 0),
    wrapped_links: htmlResult.wrapped_links + (textResult?.wrapped_links || 0)
  }
}

/**
 * Validates if a URL is safe to redirect to
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    
    // Block localhost and internal IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsedUrl.hostname.toLowerCase()
      
      // Block localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return false
      }
      
      // Block private IP ranges
      if (hostname.match(/^10\./) ||
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./) ||
          hostname.match(/^192\.168\./)) {
        return false
      }
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Extracts tracking data from URL parameters
 */
export function parseTrackingUrl(url: string): TrackingLinkData | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    
    // Extract email ID from path: /api/track/click/[emailId]
    const emailId = pathParts[4]
    if (!emailId) return null
    
    const originalUrl = urlObj.searchParams.get('url')
    if (!originalUrl) return null
    
    return {
      email_id: emailId,
      url: originalUrl,
      link_id: urlObj.searchParams.get('linkId') || undefined,
      contact_id: urlObj.searchParams.get('contactId') || undefined
    }
  } catch {
    return null
  }
}

/**
 * Gets the client IP address from the request
 */
export function getClientIp(request: Request): string {
  // Check for X-Forwarded-For header (common in proxy setups)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  // Check for X-Real-IP header
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  
  // Fallback to connection remote address (may not be available in all environments)
  return 'unknown'
}

/**
 * Anonymizes IP address for privacy compliance
 */
export function anonymizeIp(ip: string): string {
  if (ip === 'unknown') return ip
  
  try {
    // For IPv4, zero out the last octet
    if (ip.includes('.')) {
      const parts = ip.split('.')
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0`
      }
    }
    
    // For IPv6, zero out the last 64 bits
    if (ip.includes(':')) {
      const parts = ip.split(':')
      if (parts.length >= 4) {
        return `${parts.slice(0, 4).join(':')}::`
      }
    }
    
    return ip
  } catch {
    return 'unknown'
  }
} 