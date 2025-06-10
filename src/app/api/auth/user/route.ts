// src/app/api/auth/user/route.ts
// This version doesn't use withAuth wrapper to avoid circular dependency

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get member with profile
    const { data: member, error } = await supabase
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

    if (error || !member) {
      console.error('Member not found, creating...', error)
      
      // Create member if doesn't exist
      const { data: newMember } = await supabase
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

      if (newMember) {
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
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email
        },
        member: newMember || {
          id: user.id,
          company_id: '00000000-0000-0000-0000-000000000001',
          email: user.email,
          status: 'active',
          level: 1
        },
        profile: {
          first_name: 'New',
          last_name: 'User',
          preferences: {
            notifications_enabled: true,
            email_reminders: true,
            celebration_animations: true,
            theme: 'light'
          }
        }
      })
    }

    // Get user's company info
    let company = null
    if (member.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, domain')
        .eq('id', member.company_id)
        .single()
      
      company = companyData
    }

    // Format response
    const userProfile = member.member_profiles?.[0] || null

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      member: {
        id: member.id,
        company_id: member.company_id,
        email: member.email,
        username: member.username,
        status: member.status,
        level: member.level,
        sponsor_id: member.sponsor_id,
        created_at: member.created_at
      },
      profile: userProfile ? {
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        avatar_url: userProfile.avatar_url,
        timezone: userProfile.timezone,
        preferences: userProfile.preferences
      } : null,
      company
    })
  } catch (error) {
    console.error('Get user error:', error)
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