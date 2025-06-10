export interface LandingPage {
  id: string;
  member_id: string;
  slug: string; // This will be the username
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  template_id: string | null;
  content: LandingPageContent;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  member?: Member;
  template?: PageTemplate;
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

export interface PageTemplate {
  id: string;
  company_id: string;
  name: string;
  thumbnail_url: string | null;
  schema: any; // Template structure definition
  default_content: any; // Default values
  created_at: string;
}

export interface LeadSubmission {
  id: string;
  landing_page_id: string;
  member_id: string;
  // Lead information
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  // Tracking
  source_url: string | null;
  referrer: string | null;
  ip_address: string | null;
  user_agent: string | null;
  form_data: Record<string, any>;
  created_at: string;
  // Relations
  landing_page?: LandingPage;
  contact?: Contact;
}

export interface PageVisit {
  id: string;
  landing_page_id: string;
  visitor_id: string | null;
  referrer: string | null;
  utm_params: UTMParams;
  visited_at: string;
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface PageAnalytics {
  date: string;
  views: number;
  unique_visitors: number;
  form_submissions: number;
  conversion_rate: number;
}

export interface Member {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
}

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
} 