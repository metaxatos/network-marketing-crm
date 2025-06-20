import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentMember } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🔍 Dashboard Debug API - Starting comprehensive test')
    const supabase = await createClient()
    
    // Test 1: Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔐 Auth check:', { hasUser: !!user, authError: authError?.message })
    
    if (!user) {
      return Response.json({
        success: false,
        error: 'Not authenticated',
        timestamp: new Date().toISOString(),
        tests: {
          auth: { status: 'FAILED', error: 'No user found' }
        }
      }, { status: 401 })
    }
    
    const tests: any = {
      auth: { status: 'PASSED', userId: user.id }
    }
    
    // Test 2: Check member lookup
    try {
      const member = await getCurrentMember(user.id)
      tests.member = { 
        status: 'PASSED', 
        memberId: member?.id,
        companyId: member?.company_id,
        hasCompany: !!member?.company_id
      }
      console.log('👤 Member check:', tests.member)
    } catch (memberError: any) {
      tests.member = { 
        status: 'FAILED', 
        error: memberError.message 
      }
      console.error('👤 Member check failed:', memberError)
    }
    
    // Test 3: Dashboard metrics API
    try {
      const metricsResponse = await fetch(`${req.nextUrl.origin}/api/dashboard/metrics`, {
        headers: {
          'Cookie': req.headers.get('Cookie') || ''
        }
      })
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        tests.metrics = { 
          status: 'PASSED', 
          data: metricsData,
          responseTime: `${Date.now() - startTime}ms`
        }
      } else {
        const errorText = await metricsResponse.text()
        tests.metrics = { 
          status: 'FAILED', 
          httpStatus: metricsResponse.status,
          error: errorText
        }
      }
      console.log('📊 Metrics API test:', tests.metrics.status)
    } catch (metricsError: any) {
      tests.metrics = { 
        status: 'FAILED', 
        error: metricsError.message 
      }
      console.error('📊 Metrics API failed:', metricsError)
    }
    
    // Test 4: Contacts API
    try {
      const contactsResponse = await fetch(`${req.nextUrl.origin}/api/contacts`, {
        headers: {
          'Cookie': req.headers.get('Cookie') || ''
        }
      })
      
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json()
        tests.contacts = { 
          status: 'PASSED', 
          count: contactsData?.contacts?.length || 0,
          responseTime: `${Date.now() - startTime}ms`
        }
      } else {
        const errorText = await contactsResponse.text()
        tests.contacts = { 
          status: 'FAILED', 
          httpStatus: contactsResponse.status,
          error: errorText
        }
      }
      console.log('👥 Contacts API test:', tests.contacts.status)
    } catch (contactsError: any) {
      tests.contacts = { 
        status: 'FAILED', 
        error: contactsError.message 
      }
      console.error('👥 Contacts API failed:', contactsError)
    }
    
    // Test 5: Activity feed API
    try {
      const activitiesResponse = await fetch(`${req.nextUrl.origin}/api/dashboard/activities`, {
        headers: {
          'Cookie': req.headers.get('Cookie') || ''
        }
      })
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        tests.activities = { 
          status: 'PASSED', 
          count: activitiesData?.activities?.length || 0,
          responseTime: `${Date.now() - startTime}ms`
        }
      } else {
        const errorText = await activitiesResponse.text()
        tests.activities = { 
          status: 'FAILED', 
          httpStatus: activitiesResponse.status,
          error: errorText
        }
      }
      console.log('📋 Activities API test:', tests.activities.status)
    } catch (activitiesError: any) {
      tests.activities = { 
        status: 'FAILED', 
        error: activitiesError.message 
      }
      console.error('📋 Activities API failed:', activitiesError)
    }
    
    // Test 6: Email history API
    try {
      const emailsResponse = await fetch(`${req.nextUrl.origin}/api/emails/history`, {
        headers: {
          'Cookie': req.headers.get('Cookie') || ''
        }
      })
      
      if (emailsResponse.ok) {
        const emailsData = await emailsResponse.json()
        tests.emails = { 
          status: 'PASSED', 
          count: emailsData?.emails?.length || 0,
          responseTime: `${Date.now() - startTime}ms`
        }
      } else {
        const errorText = await emailsResponse.text()
        tests.emails = { 
          status: 'FAILED', 
          httpStatus: emailsResponse.status,
          error: errorText
        }
      }
      console.log('📧 Emails API test:', tests.emails.status)
    } catch (emailsError: any) {
      tests.emails = { 
        status: 'FAILED', 
        error: emailsError.message 
      }
      console.error('📧 Emails API failed:', emailsError)
    }
    
    // Test 7: Database direct queries
    try {
      // Test basic table access
      const { data: contactsCount, error: contactsCountError } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        
      const { data: emailsCount, error: emailsCountError } = await supabase
        .from('sent_emails')
        .select('id', { count: 'exact', head: true })
        
      const { data: activitiesCount, error: activitiesCountError } = await supabase
        .from('member_activities')
        .select('id', { count: 'exact', head: true })
        
      tests.database = {
        status: 'PASSED',
        tables: {
          contacts: { count: contactsCount, error: contactsCountError?.message },
          sent_emails: { count: emailsCount, error: emailsCountError?.message },
          member_activities: { count: activitiesCount, error: activitiesCountError?.message }
        }
      }
      console.log('🗄️ Database test:', tests.database.status)
    } catch (dbError: any) {
      tests.database = { 
        status: 'FAILED', 
        error: dbError.message 
      }
      console.error('🗄️ Database test failed:', dbError)
    }
    
    const totalTime = Date.now() - startTime
    const summary = {
      success: true,
      totalTime: `${totalTime}ms`,
      timestamp: new Date().toISOString(),
      testsRun: Object.keys(tests).length,
      testsPassed: Object.values(tests).filter((t: any) => t.status === 'PASSED').length,
      testsFailed: Object.values(tests).filter((t: any) => t.status === 'FAILED').length
    }
    
    console.log('✅ Dashboard debug complete:', summary)
    
    return Response.json({
      ...summary,
      tests,
      recommendations: generateRecommendations(tests)
    })
    
  } catch (error: any) {
    console.error('🚨 Dashboard debug failed:', error)
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      totalTime: `${Date.now() - startTime}ms`
    }, { status: 500 })
  }
}

function generateRecommendations(tests: any) {
  const recommendations = []
  
  if (tests.auth?.status === 'FAILED') {
    recommendations.push('❌ Authentication failed - user needs to log in again')
  }
  
  if (tests.member?.status === 'FAILED') {
    recommendations.push('❌ Member lookup failed - check member profile setup')
  }
  
  if (tests.metrics?.status === 'FAILED') {
    recommendations.push('❌ Metrics API failing - dashboard will show loading state')
  }
  
  if (tests.contacts?.status === 'FAILED') {
    recommendations.push('❌ Contacts API failing - contact list won\'t load')
  }
  
  if (tests.activities?.status === 'FAILED') {
    recommendations.push('❌ Activities API failing - activity feed won\'t load')
  }
  
  if (tests.emails?.status === 'FAILED') {
    recommendations.push('❌ Emails API failing - email metrics won\'t load')
  }
  
  if (tests.database?.status === 'FAILED') {
    recommendations.push('❌ Database access failed - check RLS policies and table permissions')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ All tests passed - dashboard should be working!')
  }
  
  return recommendations
} 