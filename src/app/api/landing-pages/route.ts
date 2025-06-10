import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth } from '@/lib/api-helpers'
import type { LandingPageResponse } from '@/types/api'

// GET /api/landing-pages - Get user's landing pages
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()

    // Get landing pages with stats
    const { data: pages, error } = await supabase
      .from('landing_pages')
      .select(`
        id,
        slug,
        title,
        is_published,
        created_at,
        updated_at
      `)
      .eq('member_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get visit and lead stats for each page
    const pagesWithStats = await Promise.all(
      (pages || []).map(async (page) => {
        // Get visit count
        const { count: visits } = await supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .eq('landing_page_id', page.id)

        // Get lead count
        const { count: leads } = await supabase
          .from('lead_captures')
          .select('*', { count: 'exact', head: true })
          .eq('landing_page_id', page.id)

        return {
          id: page.id,
          slug: page.slug,
          title: page.title,
          isPublished: page.is_published,
          visits: visits || 0,
          leads: leads || 0,
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