import { createClient } from '@/lib/supabase/server';

export async function trackPageVisit(
  landingPageId: string, 
  utmParams?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  }
) {
  const supabase = await createClient();
  
  try {
    // Create page visit record
    await supabase
      .from('page_visits')
      .insert({
        landing_page_id: landingPageId,
        visitor_id: generateVisitorId(),
        referrer: null, // Can't access referrer server-side
        utm_params: utmParams || {}
      });

    // Get or create today's analytics record
    const today = new Date().toISOString().split('T')[0];
    
    const { data: analytics } = await supabase
      .from('page_analytics')
      .select('id, views')
      .eq('landing_page_id', landingPageId)
      .eq('date', today)
      .single();

    if (analytics) {
      // Update existing record
      await supabase
        .from('page_analytics')
        .update({ 
          views: analytics.views + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', analytics.id);
    } else {
      // Create new record
      await supabase
        .from('page_analytics')
        .insert({
          landing_page_id: landingPageId,
          date: today,
          views: 1,
          unique_visitors: 1,
          form_submissions: 0
        });
    }
  } catch (error) {
    console.error('Error tracking page visit:', error);
  }
}

// Helper function to generate visitor ID
function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 