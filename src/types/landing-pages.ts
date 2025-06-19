export interface LandingPage {
  id: string;
  member_id: string;
  slug: string; // This will be the username
  title: string;
  meta_title?: string;
  meta_description?: string;
  content: LandingPageContent;
  views_count: number; // Simplified analytics - single counter instead of separate table
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  member?: Member;
}

export interface LandingPageContent {
  // Flexible JSON structure for different templates
  headline?: string;
  subheadline?: string;
  description?: string;
  profileImage?: string;
  ctaButton?: {
    text: string;
    action: 'form' | 'link' | 'call';
    link?: string;
  };
  sections?: Array<{
    type: 'text' | 'image' | 'video' | 'testimonial' | 'form';
    content: any;
  }>;
  customCss?: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface LeadSubmission {
  id: string;
  landing_page_id: string;
  member_id: string;
  // Lead information
  name: string;
  email: string;
  phone?: string;
  message?: string;
  // Tracking
  source_url?: string;
  referrer?: string;
  ip_address?: string;
  user_agent?: string;
  form_data: Record<string, any>;
  created_at: string;
  // Relations
  landing_page?: LandingPage;
  contact?: Contact;
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// Simplified analytics data for UI display
export interface LandingPageStats {
  total_views: number;
  total_leads: number;
  conversion_rate: number;
  recent_activity: {
    views_today: number;
    leads_today: number;
    views_this_week: number;
    leads_this_week: number;
  };
}

export interface Member {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
} 