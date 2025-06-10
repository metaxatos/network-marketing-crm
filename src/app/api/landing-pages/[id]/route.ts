import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, withAuth, validateBody, sanitizeInput } from '@/lib/api-helpers'
import type { UpdateLandingPageRequest } from '@/types/api'

// PUT /api/landing-pages/[id] - Update landing page content
export const PUT = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop()
    
    if (!id) {
      return apiError('Landing page ID is required', 400)
    }

    const supabase = await createClient()
    
    // Verify page ownership
    const { data: existingPage } = await supabase
      .from('landing_pages')
      .select('id, title')
      .eq('id', id)
      .eq('member_id', userId)
      .single()

    if (!existingPage) {
      return apiError('Landing page not found', 404)
    }

    // Validate request body
    const body = await validateBody<UpdateLandingPageRequest>(req, (data) => {
      const updates: UpdateLandingPageRequest = {}
      
      if (data.title !== undefined) {
        if (data.title.trim().length === 0) {
          throw new Error('Title cannot be empty')
        }
        updates.title = sanitizeInput(data.title)
      }
      
      if (data.content !== undefined) {
        updates.content = data.content // Content structure is validated by frontend
      }
      
      if (data.isPublished !== undefined) {
        updates.isPublished = data.isPublished
      }

      return updates
    })

    // Update landing page
    const { data: updatedPage, error } = await supabase
      .from('landing_pages')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('member_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log activity if publishing status changed
    if (body.isPublished !== undefined) {
      await supabase.from('member_activities').insert({
        member_id: userId,
        activity_type: body.isPublished ? 'page_published' : 'page_unpublished',
        metadata: {
          page_id: id,
          page_title: updatedPage.title,
        },
      })
    }

    return apiResponse({
      page: {
        id: updatedPage.id,
        slug: updatedPage.slug,
        title: updatedPage.title,
        isPublished: updatedPage.is_published,
        updatedAt: updatedPage.updated_at,
      },
    }, 200, 'Landing page updated successfully')
  } catch (error) {
    console.error('Update landing page error:', error)
    return apiError(
      error instanceof Error ? error.message : 'Failed to update landing page',
      400
    )
  }
}) 