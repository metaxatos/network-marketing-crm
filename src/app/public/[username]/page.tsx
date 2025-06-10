import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PublicLandingPage } from '@/components/landing-pages/public-landing-page';
import { trackPageVisit } from '@/lib/analytics';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = await createClient();
  const resolvedParams = await params;
  
  const { data: landingPage } = await supabase
    .from('landing_pages')
    .select('title, meta_title, meta_description')
    .eq('slug', resolvedParams.username)
    .eq('is_published', true)
    .single();

  if (!landingPage) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }

  return {
    title: landingPage.meta_title || landingPage.title || 'Landing Page',
    description: landingPage.meta_description || 'Welcome to my page',
    openGraph: {
      title: landingPage.meta_title || landingPage.title,
      description: landingPage.meta_description || 'Welcome to my page',
    }
  };
}

export default async function PublicLandingPageRoute({ params, searchParams }: PageProps) {
  const supabase = await createClient();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Fetch landing page with member info
  const { data: landingPage, error } = await supabase
    .from('landing_pages')
    .select(`
      *,
      member:members(
        id,
        username,
        email,
        phone,
        member_profiles(
          first_name,
          last_name,
          avatar_url
        )
      )
    `)
    .eq('slug', resolvedParams.username)
    .eq('is_published', true)
    .single();

  // 404 if not found or not published
  if (error || !landingPage) {
    notFound();
  }

  // Track visit (server-side)
  await trackPageVisit(landingPage.id, {
    utm_source: resolvedSearchParams.utm_source,
    utm_medium: resolvedSearchParams.utm_medium,
    utm_campaign: resolvedSearchParams.utm_campaign,
    utm_term: resolvedSearchParams.utm_term,
    utm_content: resolvedSearchParams.utm_content
  });

  return <PublicLandingPage landingPage={landingPage} />;
} 