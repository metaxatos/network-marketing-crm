import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api-helpers'

// GET /api/public/pages/[slug] - Get public landing page (no auth required)
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.pathname.split('/').pop()
    
    if (!slug) {
      return apiError('Page slug is required', 400)
    }

    // Extract member username from the URL if present
    // Expected formats: /api/public/pages/username/slug or /api/public/pages/slug
    const pathParts = req.nextUrl.pathname.split('/')
    let memberUsername: string | undefined
    let pageSlug = slug

    // Check if we have a username in the path
    if (pathParts.length > 5) {
      memberUsername = pathParts[pathParts.length - 2]
      pageSlug = pathParts[pathParts.length - 1]
    }

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('landing_pages')
      .select(`
        id,
        slug,
        title,
        meta_description,
        content,
        member:members!inner (
          id,
          username,
          member_profiles!member_id (
            first_name,
            last_name
          )
        )
      `)
      .eq('slug', pageSlug)
      .eq('is_published', true)

    // If username provided, filter by it
    if (memberUsername) {
      query = query.eq('member.username', memberUsername)
    }

    const { data: pages, error } = await query

    if (error || !pages || pages.length === 0) {
      return apiError('Page not found', 404)
    }

    // Get the first matching page
    const page = pages[0]
    const member = Array.isArray(page.member) ? page.member[0] : page.member
    const memberProfile = member?.member_profiles?.[0]

    // Track page visit
    await supabase.from('page_visits').insert({
      landing_page_id: page.id,
      visitor_id: req.headers.get('x-forwarded-for') || 'anonymous',
      referrer: req.headers.get('referer') || null,
      utm_params: extractUTMParams(req.nextUrl.searchParams),
    })

    return apiResponse({
      page: {
        id: page.id,
        title: page.title,
        metaDescription: page.meta_description,
        content: page.content,
        memberInfo: {
          id: member?.id,
          name: memberProfile ? `${memberProfile.first_name} ${memberProfile.last_name}` : 'Team Member',
        },
      },
    }, 200)
  } catch (error) {
    console.error('Get public page error:', error)
    return apiError('Failed to retrieve page', 500)
  }
}

function extractUTMParams(searchParams: URLSearchParams): Record<string, string> {
  const utmParams: Record<string, string> = {}
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  
  utmKeys.forEach(key => {
    const value = searchParams.get(key)
    if (value) {
      utmParams[key] = value
    }
  })
  
  return utmParams
} 