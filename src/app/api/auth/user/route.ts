// src/app/api/auth/user/route.ts
// Simplified version to fix infinite loading

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Add timeout wrapper with proper typing
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ])
}

export async function GET(req: NextRequest) {
  console.log('[API /auth/user] Starting request')
  
  try {
    const supabase = await createClient()
    
    // Get user with timeout
    const authResult = await withTimeout(
      supabase.auth.getUser(),
      3000 // 3 second timeout
    )
    
    const { data: { user }, error: authError } = authResult
    
    console.log('[API /auth/user] Auth result:', { 
      hasUser: !!user, 
      userId: user?.id,
      error: authError?.message 
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Try to get member data with timeout
    try {
      // Construct the full query including .single()
      const memberQuery = supabase
        .from('members')
        .select(`
          *,
          member_profiles!member_id (
            first_name,
            last_name,
            avatar_url,
            timezone,
            preferences
          )
        `)
        .eq('id', user.id)
        .single()

      // Convert PostgrestBuilder to Promise with .then()
      const memberResult = await withTimeout(memberQuery.then(), 3000)
      const { data: member, error: memberError } = memberResult

      if (memberError) {
        console.error('[API /auth/user] Member query error:', memberError)
        
        // Return basic user data even if member query fails
        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email
          },
          member: null,
          profile: null,
          company: null
        })
      }

      // Get company if member exists
      let company = null
      if (member?.company_id) {
        try {
          const companyQuery = supabase
            .from('companies')
            .select('id, name, domain')
            .eq('id', member.company_id)
            .single()
            
          // Convert PostgrestBuilder to Promise with .then()
          const companyResult = await withTimeout(companyQuery.then(), 2000)
          const { data: companyData } = companyResult
          company = companyData
        } catch (error) {
          console.warn('[API /auth/user] Company query failed:', error)
        }
      }

      // Format response
      const userProfile = member?.member_profiles?.[0] || null

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email
        },
        member: member ? {
          id: member.id,
          company_id: member.company_id,
          email: member.email,
          username: member.username,
          status: member.status,
          level: member.level,
          sponsor_id: member.sponsor_id,
          created_at: member.created_at
        } : null,
        profile: userProfile ? {
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          avatar_url: userProfile.avatar_url,
          timezone: userProfile.timezone,
          preferences: userProfile.preferences
        } : null,
        company
      })
      
    } catch (queryError: any) {
      console.error('[API /auth/user] Database query error:', queryError)
      
      // Still return basic user data
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email
        },
        member: null,
        profile: null,
        company: null
      })
    }
    
  } catch (error: any) {
    console.error('[API /auth/user] Fatal error:', error)
    
    // Check if it's a timeout
    if (error.message === 'Operation timed out') {
      return NextResponse.json(
        { error: 'Request timeout - please try again' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
