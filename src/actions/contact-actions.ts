'use server'

import { supabase } from '@/lib/supabase'

export async function updateContactMetrics(memberId: string) {
  try {
    // Count contacts added this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { count: contactsThisWeek } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .gte('created_at', oneWeekAgo.toISOString())

    // Update member metrics
    await supabase
      .from('member_metrics')
      .upsert({
        member_id: memberId,
        contacts_this_week: contactsThisWeek || 0,
        last_updated: new Date().toISOString()
      })

    return { success: true }
  } catch (error) {
    console.error('Failed to update contact metrics:', error)
    return { success: false, error: 'Failed to update metrics' }
  }
} 