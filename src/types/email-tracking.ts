export interface EmailClick {
  id: string
  email_id: string
  contact_id?: string
  url: string
  link_position?: number
  clicked_at: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  created_at: string
}

export interface EmailTrackingData {
  email_id: string
  contact_id: string
  original_url: string
  link_position: number
}

export interface EmailClickAnalytics {
  email_id: string
  template_id?: string
  template_name?: string
  subject: string
  sent_at: string
  total_clicks: number
  unique_clicks: number
  click_through_rate: number
  clicks: EmailClick[]
}

export interface ContactClickHistory {
  contact_id: string
  contact_name: string
  total_clicks: number
  last_clicked_at?: string
  emails_clicked: {
    email_id: string
    subject: string
    sent_at: string
    click_count: number
    last_clicked_at: string
  }[]
}

export interface ClickMetrics {
  total_clicks: number
  unique_clicks: number
  click_through_rate: number
  most_clicked_links: {
    url: string
    click_count: number
    unique_clicks: number
  }[]
  time_series: {
    date: string
    clicks: number
    unique_clicks: number
  }[]
}

export interface LinkTrackingResult {
  html: string
  text?: string
  total_links: number
  wrapped_links: number
}

export interface TrackingLinkData {
  email_id: string
  url: string
  link_id?: string
  contact_id?: string
} 