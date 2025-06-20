import { createAdminClient } from '@/lib/supabase/admin-client'
import { apiResponse, apiError } from '@/lib/api-helpers'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const email = url.searchParams.get('email')
    
    if (!email) {
      return apiError('Email parameter is required', 400)
    }

    const adminClient = createAdminClient()

    // Check auth.users table by querying members table first to get user ID
    let authUser = null
    let authError = null
    try {
      // First, try to get user ID from members table
      const { data: memberData } = await adminClient
        .from('members')
        .select('id')
        .eq('email', email)
        .single()
      
      if (memberData?.id) {
        const { data: authData, error: authErr } = await adminClient.auth.admin.getUserById(memberData.id)
        authUser = authData.user
        authError = authErr
      } else {
        authError = 'User not found in members table'
      }
    } catch (err: any) {
      authError = err.message
    }

    // Check members table
    let member = null
    let memberError = null
    try {
      const { data: memberData, error: memberErr } = await adminClient
        .from('members')
        .select('*')
        .eq('email', email)
        .single()
      member = memberData
      memberError = memberErr
    } catch (err: any) {
      memberError = err.message
    }

    // Check for orphaned auth users
    let orphanedUsers = []
    try {
      const { data: orphanedData } = await adminClient
        .from('auth.users')
        .select(`
          id, 
          email, 
          email_confirmed_at, 
          created_at,
          members!left(id)
        `)
        .is('members.id', null)
        .limit(10)
      orphanedUsers = orphanedData || []
    } catch (err: any) {
      // Ignore orphaned users query errors for now
    }

    return apiResponse({
      email,
      authUser: authUser ? {
        id: authUser.id,
        email: authUser.email,
        emailConfirmed: !!authUser.email_confirmed_at,
        createdAt: authUser.created_at,
        metadata: authUser.user_metadata
      } : null,
      authError,
      member: member ? {
        id: member.id,
        email: member.email,
        username: member.username,
        name: member.name,
        firstName: member.first_name,
        lastName: member.last_name,
        status: member.status,
        companyId: member.company_id,
        createdAt: member.created_at
      } : null,
      memberError,
      status: {
        userExists: !!authUser,
        memberExists: !!member,
        isOrphaned: !!authUser && !member,
        canLogin: !!authUser && !!member && member.status === 'active',
        needsCompletion: !!authUser && !member
      },
      orphanedUsersCount: orphanedUsers.length,
      recommendations: generateRecommendations(authUser, member, authError, memberError)
    })

  } catch (error: any) {
    console.error('[Debug User Status] Error:', error)
    return apiError(`Debug error: ${error.message}`, 500)
  }
}

function generateRecommendations(authUser: any, member: any, authError: any, memberError: any): string[] {
  const recommendations = []

  if (authError) {
    recommendations.push(`❌ Auth Error: ${authError}`)
  }

  if (memberError && memberError.code !== 'PGRST116') {
    recommendations.push(`❌ Member Error: ${memberError}`)
  }

  if (authUser && !member) {
    recommendations.push('🔧 ORPHANED USER: Create member profile for this auth user')
    recommendations.push('💡 Run: Complete signup process or manual member creation')
  }

  if (!authUser && !member) {
    recommendations.push('✅ CLEAN STATE: User can proceed with normal signup')
  }

  if (authUser && member) {
    if (member.status === 'active') {
      recommendations.push('✅ COMPLETE: User should be able to log in normally')
    } else {
      recommendations.push(`⚠️ INACTIVE: Member status is '${member.status}' - update to 'active'`)
    }
  }

  if (authUser && member && (!member.first_name || !member.last_name)) {
    recommendations.push('🔧 INCOMPLETE PROFILE: Member missing first_name/last_name fields')
  }

  return recommendations
}

export async function POST(req: Request) {
  return apiError('This endpoint only accepts GET requests', 405)
} 