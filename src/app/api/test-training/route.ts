import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

export const GET = async (req: NextRequest) => {
  try {
    const supabase = createAdminClient()
    
    console.log('🔍 Testing training database with admin client...')
    
    // Test 1: Check if courses exist
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
    
    console.log('📚 Courses found:', courses?.length || 0, coursesError)
    
    // Test 2: Check if training_videos exist
    const { data: videos, error: videosError } = await supabase
      .from('training_videos')
      .select('*')
    
    console.log('🎥 Videos found:', videos?.length || 0, videosError)
    
    // Test 3: Check if member_progress exists
    const { data: progress, error: progressError } = await supabase
      .from('member_progress')
      .select('*')
    
    console.log('📊 Progress records found:', progress?.length || 0, progressError)
    
    // Test 4: Try the full query that the API uses
    const { data: fullQuery, error: fullError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        cover_image,
        order_index,
        is_published,
        training_videos (
          id,
          title,
          description,
          video_url,
          video_platform,
          thumbnail_url,
          duration_seconds,
          module_name,
          module_order,
          lesson_order,
          order_index,
          is_required,
          is_published
        )
      `)
      .eq('is_published', true)
      .eq('training_videos.is_published', true)
      .order('order_index', { ascending: true })
    
    console.log('🔄 Full query result:', fullQuery?.length || 0, fullError)
    
    return Response.json({
      success: true,
      debug: {
        courses: {
          count: courses?.length || 0,
          data: courses,
          error: coursesError
        },
        videos: {
          count: videos?.length || 0,
          data: videos,
          error: videosError
        },
        progress: {
          count: progress?.length || 0,
          data: progress,
          error: progressError
        },
        fullQuery: {
          count: fullQuery?.length || 0,
          data: fullQuery,
          error: fullError
        }
      }
    })
  } catch (error) {
    console.error('Test API error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 