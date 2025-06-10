import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId, name, email, phone, message } = body;

    // Validate required fields
    if (!pageId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get landing page details
    const { data: landingPage, error: pageError } = await supabase
      .from('landing_pages')
      .select('member_id')
      .eq('id', pageId)
      .single();

    if (pageError || !landingPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      );
    }

    // Create lead submission
    const { data: lead, error: leadError } = await supabase
      .from('lead_captures')
      .insert({
        landing_page_id: pageId,
        member_id: landingPage.member_id,
        name,
        email,
        phone: phone || null,
        message: message || null,
        form_data: body,
        source_url: request.headers.get('referer') || null,
        referrer: request.headers.get('referer') || null,
        user_agent: request.headers.get('user-agent') || null
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      return NextResponse.json(
        { error: 'Failed to submit lead' },
        { status: 500 }
      );
    }

    // Create contact record (only if doesn't exist)
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('member_id', landingPage.member_id)
      .eq('email', email)
      .single();

    if (!existingContact) {
      const { error: contactError } = await supabase
        .from('contacts')
        .insert({
          member_id: landingPage.member_id,
          name,
          email,
          phone: phone || null,
          status: 'lead',
          tags: ['landing_page_lead'],
          custom_fields: { 
            source: 'landing_page',
            lead_id: lead.id 
          }
        });

      if (contactError) {
        console.error('Error creating contact:', contactError);
        // Don't fail the request if contact creation fails
      }
    }



    // Update page analytics
    const today = new Date().toISOString().split('T')[0];
    
    const { data: analytics } = await supabase
      .from('page_analytics')
      .select('id, form_submissions')
      .eq('landing_page_id', pageId)
      .eq('date', today)
      .single();

    if (analytics) {
      await supabase
        .from('page_analytics')
        .update({ 
          form_submissions: analytics.form_submissions + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', analytics.id);
    } else {
      await supabase
        .from('page_analytics')
        .insert({
          landing_page_id: pageId,
          date: today,
          views: 0,
          unique_visitors: 0,
          form_submissions: 1
        });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Thank you! We will be in touch soon.' 
    });
  } catch (error) {
    console.error('Error processing lead submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 