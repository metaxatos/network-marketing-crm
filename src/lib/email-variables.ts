import { createApiClient } from '@/lib/supabase/api-client'

// Email variable types
export interface EmailVariables {
  // Member/User variables
  member_name?: string
  member_email?: string
  member_phone?: string
  member_credentials?: string
  first_name?: string
  last_name?: string
  username?: string
  sender_name?: string

  // Contact variables
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  recipient_name?: string

  // Sponsor variables
  sponsor_name?: string
  sponsor_email?: string
  sponsor_phone?: string

  // Company/System variables
  company_name?: string
  affiliate_url?: string
  login_link?: string
  unsubscribe_link?: string
  privacy_link?: string
  training_link?: string
  products_link?: string
  compensation_link?: string
  terms_link?: string
  earnings_link?: string

  // Event variables
  event_name?: string
  event_title?: string
  event_date?: string
  event_time?: string
  event_day?: string
  timezone?: string
  event_type?: string
  event_location?: string
  event_city?: string
  venue_name?: string
  venue_address?: string
  directions_link?: string
  event_url?: string
  meeting_url?: string
  zoom_link?: string
  virtual_link?: string
  registration_link?: string
  rsvp_link?: string
  vip_rsvp_link?: string
  alternate_dates_link?: string
  alternate_times_link?: string
  seats_remaining?: string
  attendee_limit?: string
  total_seats?: string
  seats_taken?: string
  free_spots?: string
  spots_remaining?: string
  registrants?: string
  rsvp_deadline?: string
  countdown_time?: string

  // Speaker/Presenter variables
  speaker_name?: string
  speaker_title?: string
  speaker_bio?: string
  speaker_initial?: string
  guest_speaker?: string

  // Achievement/Statistics variables
  rank_name?: string
  achievement_date?: string
  next_rank_name?: string
  achievement_1_number?: string
  achievement_1_label?: string
  achievement_2_number?: string
  achievement_2_label?: string
  achievement_3_number?: string
  achievement_3_label?: string
  stat_1_number?: string
  stat_1_label?: string
  stat_2_number?: string
  stat_2_label?: string
  stat_3_number?: string
  stat_3_label?: string

  // New member variables (for sponsor notifications)
  new_member_name?: string
  new_member_email?: string
  new_member_phone?: string

  // Business/Opportunity variables
  product_or_opportunity?: string
  journey_type?: string
  desired_outcome?: string
  specific_benefit?: string
  platform?: string
  calendar_link?: string
  schedule_consultation_link?: string
  support_link?: string
  team_group_link?: string
  new_countries?: string

  // Time/Scheduling variables
  day?: string
  time?: string
  meeting_time?: string
  team_call_day?: string
  team_call_time?: string
  time_option_1?: string
  time_option_2?: string
  time_option_3?: string
  training_date?: string
  training_time?: string
  next_event_time?: string
  frequency?: string

  // Countdown variables
  days?: string
  hours?: string
  minutes?: string

  // Product variables
  product_name?: string
  special_offer_link?: string

  // Medical/Clinical variables (for healthcare professionals)
  clinical_kit_link?: string
  pubmed_studies_link?: string
  clinical_trials_link?: string
  physician_portal_link?: string
  cme_resources_link?: string

  // Dynamic/custom variables
  [key: string]: string | undefined
}

// Populate email variables for a member
export async function populateEmailVariables(
  userId: string,
  contactId?: string,
  eventId?: string,
  customVariables: Partial<EmailVariables> = {}
): Promise<EmailVariables> {
  const supabase = await createApiClient()
  const variables: EmailVariables = {}

  try {
    // Get member data
    const { data: member } = await supabase
      .from('members')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', userId)
      .single()

    if (member) {
      variables.member_name = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim()
      variables.member_email = member.email
      variables.member_phone = member.phone
      variables.first_name = member.first_name
      variables.last_name = member.last_name
      variables.username = member.username

      // Generate affiliate URL using company pattern
      if (member.company?.affiliate_url_pattern && member.username) {
        variables.affiliate_url = member.company.affiliate_url_pattern
          .replace('{{domain}}', member.company.domain || 'ourteam.gr')
          .replace('{{username}}', member.username)
      }

      // Company variables
      if (member.company) {
        variables.company_name = member.company.name
      }

      // Get sponsor information if member has one
      if (member.sponsor_id) {
        const { data: sponsor } = await supabase
          .from('members')
          .select('name, first_name, last_name, email, phone')
          .eq('id', member.sponsor_id)
          .single()

        if (sponsor) {
          variables.sponsor_name = sponsor.name || `${sponsor.first_name || ''} ${sponsor.last_name || ''}`.trim()
          variables.sponsor_email = sponsor.email
          variables.sponsor_phone = sponsor.phone
        }
      }
    }

    // Get contact data if contactId provided
    if (contactId) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('name, email, phone')
        .eq('id', contactId)
        .single()

      if (contact) {
        variables.contact_name = contact.name
        variables.contact_email = contact.email
        variables.contact_phone = contact.phone
      }
    }

    // Get event data if eventId provided
    if (eventId) {
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (event) {
        variables.event_name = event.title || event.name
        variables.event_date = event.start_time ? new Date(event.start_time).toLocaleDateString() : event.date
        variables.event_time = event.start_time ? new Date(event.start_time).toLocaleTimeString() : event.time
        variables.timezone = 'UTC' // You can make this dynamic based on member timezone
        variables.event_type = event.format === 'online' ? 'Online' : 'In-Person'
        variables.event_location = event.format === 'online' ? event.meeting_url : event.location
        variables.seats_remaining = event.max_attendees ? String(event.max_attendees - (event.current_attendees || 0)) : ''

        // You can add speaker information if it's in the event data
        // variables.speaker_name = event.speaker_name
        // variables.speaker_title = event.speaker_title
        // variables.speaker_bio = event.speaker_bio
        // variables.speaker_initial = event.speaker_name?.charAt(0) || 'S'
      }
    }

    // System links
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ourteam.gr'
    variables.login_link = `${baseUrl}/login`
    variables.training_link = `${baseUrl}/training`
    variables.products_link = `${baseUrl}/products`
    variables.compensation_link = `${baseUrl}/compensation`
    variables.privacy_link = `${baseUrl}/privacy`
    variables.terms_link = `${baseUrl}/terms`
    variables.earnings_link = `${baseUrl}/earnings-disclaimer`
    variables.unsubscribe_link = `${baseUrl}/unsubscribe?email=${encodeURIComponent(variables.member_email || '')}`
    
    // Additional system links for medical/clinical use
    variables.clinical_kit_link = `${baseUrl}/clinical-kit`
    variables.pubmed_studies_link = `${baseUrl}/studies`
    variables.clinical_trials_link = `${baseUrl}/clinical-trials`
    variables.physician_portal_link = `${baseUrl}/physician-portal`
    variables.cme_resources_link = `${baseUrl}/cme-resources`
    
    // Calendar and support links
    variables.calendar_link = `${baseUrl}/calendar`
    variables.schedule_consultation_link = `${baseUrl}/consultation`
    variables.support_link = `${baseUrl}/support`
    variables.team_group_link = `${baseUrl}/team-group`
    
    // Set recipient_name as alias for contact_name if not already set
    if (!variables.recipient_name && variables.contact_name) {
      variables.recipient_name = variables.contact_name
    }
    
    // Set sender_name as alias for member_name if not already set
    if (!variables.sender_name && variables.member_name) {
      variables.sender_name = variables.member_name
    }

    // Merge with custom variables (custom variables take precedence)
    return { ...variables, ...customVariables }

  } catch (error) {
    console.error('Error populating email variables:', error)
    // Return at least the custom variables if DB operations fail
    return customVariables as EmailVariables
  }
}

// Replace variables in email content
export function replaceEmailVariables(content: string, variables: EmailVariables): string {
  let processedContent = content

  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      processedContent = processedContent.replace(placeholder, String(value))
    }
  })

  return processedContent
}

// Get member's display name for "from" field
export async function getMemberDisplayName(userId: string): Promise<string> {
  try {
    const supabase = await createApiClient()
    const { data: member } = await supabase
      .from('members')
      .select('name, first_name, last_name, email')
      .eq('id', userId)
      .single()

    if (member) {
      // Priority: name > first_name + last_name > email
      if (member.name) return member.name
      if (member.first_name) {
        return `${member.first_name} ${member.last_name || ''}`.trim()
      }
      return member.email || 'OurTeam Member'
    }

    return 'OurTeam Member'
  } catch (error) {
    console.error('Error getting member display name:', error)
    return 'OurTeam Member'
  }
}

// Get member's email for reply-to
export async function getMemberEmail(userId: string): Promise<string> {
  try {
    const supabase = await createApiClient()
    const { data: member } = await supabase
      .from('members')
      .select('email')
      .eq('id', userId)
      .single()

    return member?.email || ''
  } catch (error) {
    console.error('Error getting member email:', error)
    return ''
  }
}
