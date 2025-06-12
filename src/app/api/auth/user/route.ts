// src/app/api/auth/user/route.ts
// This version doesn't use withAuth wrapper to avoid circular dependency

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    console.log('API /auth/user - Starting request')
    const supabase = await createClient()
    
    // Get the current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('API /auth/user - Auth check:', { userId: user?.id, error: authError })
    
    if (authError || !user) {
      console.log('API /auth/user - No authenticated user')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get member with profile - simplified query first
    console.log('API /auth/user - Fetching member data for:', user.id)
    
    const { data: member, error: memberError } = await supabase
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

    console.log('API /auth/user - Member query result:', { member, error: memberError })

    if (memberError) {
      console.error('API /auth/user - Member query error:', memberError)
      
      // If member doesn't exist, try to create it
      if (memberError.code === 'PGRST116') {
        console.log('API /auth/user - Member not found, creating...')
        
        const { data: newMember, error: createError } = await supabase
          .from('members')
          .insert({
            id: user.id,
            company_id: '00000000-0000-0000-0000-000000000001',
            email: user.email,
            status: 'active',
            level: 1
          })
          .select()
          .single()

        if (createError) {
          console.error('API /auth/user - Failed to create member:', createError)
          return NextResponse.json(
            { error: 'Failed to create member record' },
            { status: 500 }
          )
        }

        // Create profile
        await supabase
          .from('member_profiles')
          .insert({
            member_id: user.id,
            first_name: 'New',
            last_name: 'User',
            preferences: {
              notifications_enabled: true,
              email_reminders: true,
              celebration_animations: true,
              theme: 'light'
            }
          })

        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email
          },
          member: newMember,
          profile: {
            first_name: 'New',
            last_name: 'User',
            preferences: {
              notifications_enabled: true,
              email_reminders: true,
              celebration_animations: true,
              theme: 'light'
            }
          },
          company: null
        })
      }
      
      // Other errors - return basic user info
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

    // Get user's company info
    let company = null
    if (member?.company_id) {
      console.log('API /auth/user - Fetching company data for:', member.company_id)
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, domain')
        .eq('id', member.company_id)
        .single()
      
      console.log('API /auth/user - Company query result:', { companyData, error: companyError })
      company = companyData
    }

    // Format response
    const userProfile = member?.member_profiles?.[0] || null

    const response = {
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
    }

    console.log('API /auth/user - Sending response')
    return NextResponse.json(response)
  } catch (error) {
    console.error('API /auth/user - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve user information' },
      { status: 500 }
    )
  }
}

// Also handle OPTIONS for CORS
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