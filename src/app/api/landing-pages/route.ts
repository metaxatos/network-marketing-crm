import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'

// Define simplified types for new schema
interface LandingPageResponse {
  pages: Array<{
    id: string
    slug: string
    title: string
    isPublished: boolean
    views: number
    leads: number
    createdAt: string
    updatedAt: string
  }>
}

interface DatabaseLandingPage {
  id: string
  slug: string
  title: string
  views_count: number
  is_published: boolean
  created_at: string
  updated_at: string
}

// GET /api/landing-pages - Get all landing pages for the user (simplified analytics)
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()

    // Get landing pages with simplified analytics (views_count is stored directly)
    const { data: pages, error } = await supabase
      .from('landing_pages')
      .select(`
        id,
        slug,
        title,
        views_count,
        is_published,
        created_at,
        updated_at
      `)
      .eq('member_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    // Count leads for each page from communications table (lead captures stored as communications)
    const pagesWithStats = await Promise.all(
      (pages || []).map(async (page: DatabaseLandingPage) => {
        // Get lead count from communications (lead captures)
        const { count: leads } = await supabase
          .from('communications')
          .select('*', { count: 'exact', head: true })
          .eq('member_id', userId)
          .eq('type', 'lead_capture')
          .contains('metadata', { landing_page_id: page.id })

        return {
          id: page.id,
          slug: page.slug,
          title: page.title,
          isPublished: page.is_published,
          views: page.views_count || 0, // Simplified - stored directly in landing_pages table
          leads: leads || 0,
          createdAt: page.created_at,
          updatedAt: page.updated_at,
        }
      })
    )

    const response: LandingPageResponse = {
      pages: pagesWithStats,
    }

    return apiResponse(response, 200)
  } catch (error) {
    console.error('Get landing pages error:', error)
    return apiError('Failed to retrieve landing pages', 500)
  }
})

// POST /api/landing-pages - Create a new landing page
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    const { title, slug, content } = await req.json()

    if (!title || !slug) {
      return apiError('Title and slug are required', 400)
    }

    // Check if slug is unique for this user
    const { data: existingPage } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('member_id', userId)
      .eq('slug', slug)
      .single()

    if (existingPage) {
      return apiError('A page with this slug already exists', 400)
    }

    // Create new landing page
    const { data: newPage, error } = await supabase
      .from('landing_pages')
      .insert({
        member_id: userId,
        title,
        slug,
        content: content || {},
        views_count: 0,
        is_published: false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return apiResponse({
      page: {
        id: newPage.id,
        slug: newPage.slug,
        title: newPage.title,
        isPublished: newPage.is_published,
        views: newPage.views_count,
        leads: 0,
        createdAt: newPage.created_at,
        updatedAt: newPage.updated_at,
      },
    }, 201, 'Landing page created successfully')
  } catch (error) {
    console.error('Create landing page error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to create landing page',
      400
    )
  }
}) 