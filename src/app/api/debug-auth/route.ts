import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withAuth, getCurrentMember, apiResponse } from '@/lib/api-helpers'

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const supabase = await createClient()
    
    console.log('🔍 Debug Auth - User ID from withAuth:', userId)
    
    // Check what the supabase client thinks the user is
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('🔍 Debug Auth - Supabase user:', user?.id, userError)
    
    // Try to get member data
    let member = null
    try {
      member = await getCurrentMember(userId)
      console.log('🔍 Debug Auth - Member data:', member)
    } catch (error) {
      console.log('🔍 Debug Auth - Member error:', error)
    }
    
    // Check if this user can access courses directly
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, company_id, is_published')
      .eq('is_published', true)
    
    console.log('🔍 Debug Auth - Courses query result:', courses?.length || 0, coursesError)
    
    const debugData: any = {
      userIdFromAuth: userId,
      supabaseUser: user ? {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role
      } : null,
      supabaseUserError: userError,
      member: member,
      coursesAccessible: courses?.length || 0,
      coursesError: coursesError
    }
    
    return apiResponse(debugData, 200)
  } catch (error) {
    console.error('Debug auth error:', error)
    const errorData: any = {
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    return apiResponse(errorData, 500)
  }
}) 