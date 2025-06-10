Network Marketing CRM - Technical Specification
Table of Contents

Core Architecture & Infrastructure
User Account & Dashboard
Contact Management
Simple Emailing
Training Academy
Landing Pages & Funnels


1. Core Architecture & Infrastructure {#core-architecture}
Architecture Overview

Frontend: Next.js 14+ with App Router
Backend: Supabase (PostgreSQL, Auth, Realtime, Storage)
Email Service: Resend API
Deployment: Vercel (auto-scaling, edge functions)
State Management: Zustand for global state, React Query for server state
Styling: Tailwind CSS with custom design system

Multi-Company & Hierarchy Design
Companies Table:
- id (uuid)
- name (text)
- domain (text, unique)
- settings (jsonb)
- created_at (timestamp)

Members Table:
- id (uuid, references auth.users)
- company_id (uuid, references companies)
- sponsor_id (uuid, references members) -- upline
- position (text) -- left/right for binary
- level (int) -- depth in tree
- status (enum: active, inactive, suspended)
- created_at (timestamp)
Row Level Security (RLS) Strategy
sql-- Members can only see data within their company
CREATE POLICY "members_company_isolation" ON members
FOR ALL USING (company_id = current_user_company_id());

-- Members can only see their own contacts
CREATE POLICY "contacts_owner_only" ON contacts
FOR ALL USING (member_id = auth.uid());

2. User Account & Dashboard {#user-account-dashboard}
Architecture Overview

Auth Flow: Supabase Auth with email/password
Session Management: Server-side with httpOnly cookies
Dashboard Data: Aggregated via Supabase Functions
Real-time Updates: Supabase Realtime for activity feed

Database Schema
sql-- Extended member profile
member_profiles:
- member_id (uuid, references members)
- first_name (text)
- last_name (text)
- avatar_url (text)
- timezone (text)
- preferences (jsonb)

-- Activity tracking
member_activities:
- id (uuid)
- member_id (uuid, references members)
- activity_type (enum: contact_added, email_sent, training_completed)
- metadata (jsonb)
- created_at (timestamp)

-- Dashboard metrics (materialized view updated hourly)
member_metrics:
- member_id (uuid)
- contacts_this_week (int)
- emails_today (int)
- training_progress (float)
- last_updated (timestamp)
API Design
POST /api/auth/login
jsonRequest:
{
  "email": "user@example.com",
  "password": "securepass123"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {
      "first_name": "John",
      "last_name": "Doe"
    }
  },
  "session": "session_token"
}
GET /api/dashboard/metrics
jsonResponse:
{
  "metrics": {
    "contacts_this_week": 5,
    "emails_today": 3,
    "training_progress": 0.6
  },
  "recent_activities": [
    {
      "id": "uuid",
      "type": "contact_added",
      "description": "Added new contact: Jane Smith",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "quick_actions": {
    "has_pending_followups": true,
    "suggested_training": "Advanced Email Templates"
  }
}
Frontend Structure
/app
  /(auth)
    /login
      page.tsx          -- Login form with Supabase Auth
  /(dashboard)
    layout.tsx          -- Protected route wrapper
    page.tsx            -- Dashboard home
    
/components
  /dashboard
    MetricCard.tsx      -- Reusable metric display
    ActivityFeed.tsx    -- Real-time activity list
    QuickActions.tsx    -- Action buttons
    EmptyState.tsx      -- First-time user welcome
State Management
typescript// stores/userStore.ts
interface UserStore {
  profile: MemberProfile | null
  metrics: DashboardMetrics | null
  activities: Activity[]
  loadDashboard: () => Promise<void>
  subscribeToUpdates: () => void
}
UX Flow Implementation

Login Page:

Use Next.js middleware for auth redirect
Implement rate limiting on login attempts
Show loading state during authentication


Dashboard States:

Check member_activities count on load
If count = 0, show empty state with welcome message
Otherwise, fetch and display metrics/activities
Use Intersection Observer for infinite scroll on activity feed




3. Contact Management {#contact-management}
Architecture Overview

Data Model: Contacts belong to members with full CRUD
Search: PostgreSQL full-text search with GIN indexes
Performance: Pagination with cursor-based navigation
Offline Support: Service Worker with IndexedDB cache

Database Schema
sqlcontacts:
- id (uuid)
- member_id (uuid, references members)
- name (text, NOT NULL)
- phone (text)
- email (text)
- status (enum: lead, customer, team_member)
- tags (text[])
- custom_fields (jsonb)
- last_contacted_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

-- Full-text search index
CREATE INDEX contacts_search_idx ON contacts 
USING GIN (to_tsvector('english', name || ' ' || coalesce(email, '') || ' ' || coalesce(phone, '')));

contact_notes:
- id (uuid)
- contact_id (uuid, references contacts)
- member_id (uuid, references members)
- content (text)
- created_at (timestamp)

contact_interactions:
- id (uuid)
- contact_id (uuid, references contacts)
- interaction_type (enum: email_sent, note_added, status_changed)
- metadata (jsonb)
- created_at (timestamp)
API Design
GET /api/contacts
jsonRequest Query:
{
  "search": "john",
  "status": "lead",
  "cursor": "last_contact_id",
  "limit": 20
}

Response:
{
  "contacts": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "status": "lead",
      "last_contacted_at": "2024-01-10T15:30:00Z"
    }
  ],
  "next_cursor": "uuid",
  "has_more": true
}
POST /api/contacts
jsonRequest:
{
  "name": "Jane Smith",
  "phone": "+1234567890",
  "email": "jane@example.com",
  "status": "lead"
}

Response:
{
  "contact": {
    "id": "uuid",
    "name": "Jane Smith",
    ...
  }
}
POST /api/contacts/:id/notes
jsonRequest:
{
  "content": "Had a great call about the product opportunity"
}

Response:
{
  "note": {
    "id": "uuid",
    "content": "Had a great call about the product opportunity",
    "created_at": "2024-01-15T16:00:00Z"
  }
}
Frontend Structure
/app/(dashboard)/contacts
  page.tsx              -- Contact list with search
  [id]/
    page.tsx            -- Single contact view
    edit/page.tsx       -- Edit contact form
  new/page.tsx          -- Add contact form

/components/contacts
  ContactCard.tsx       -- List item component
  ContactForm.tsx       -- Reusable add/edit form
  ContactSearch.tsx     -- Search with debounce
  ContactTimeline.tsx   -- Activity timeline
  NoteModal.tsx         -- Add note overlay
Search Implementation
typescript// Pseudocode for search handling
function useContactSearch() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  
  const { data, isLoading } = useQuery({
    queryKey: ['contacts', debouncedQuery],
    queryFn: () => searchContacts(debouncedQuery),
    enabled: debouncedQuery.length > 0
  })
  
  return { query, setQuery, results: data, isLoading }
}
Offline Sync Strategy
typescript// Service Worker pseudocode
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/contacts')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
        .catch(() => getFromIndexedDB(event.request))
    )
  }
})

4. Simple Emailing {#simple-emailing}
Architecture Overview

Template Engine: React Email for template rendering
Email Service: Resend API with webhook tracking
Analytics: Click tracking via redirect URLs
Queue System: Supabase Edge Functions for async sending

Database Schema
sqlemail_templates:
- id (uuid)
- company_id (uuid, references companies)
- name (text)
- subject (text)
- body_html (text)
- body_text (text)
- category (enum: follow_up, invitation, welcome)
- variables (text[]) -- e.g., ['contact_name', 'sender_name']
- is_active (boolean)

sent_emails:
- id (uuid)
- member_id (uuid, references members)
- contact_id (uuid, references contacts)
- template_id (uuid, references email_templates)
- subject (text)
- body_html (text)
- status (enum: pending, sent, failed)
- sent_at (timestamp)
- opened_at (timestamp)
- clicked_at (timestamp)

email_clicks:
- id (uuid)
- email_id (uuid, references sent_emails)
- url (text)
- clicked_at (timestamp)
- ip_address (inet)
- user_agent (text)
API Design
GET /api/email-templates
jsonResponse:
{
  "templates": [
    {
      "id": "uuid",
      "name": "Follow-up After Call",
      "category": "follow_up",
      "preview": "Hi {contact_name}, it was great speaking with you..."
    }
  ]
}
POST /api/emails/send
jsonRequest:
{
  "contact_id": "uuid",
  "template_id": "uuid",
  "variables": {
    "custom_message": "Looking forward to our next call!"
  }
}

Response:
{
  "email": {
    "id": "uuid",
    "status": "sent",
    "sent_at": "2024-01-15T17:00:00Z"
  }
}
Email Sending Flow
typescript// Edge Function pseudocode
async function sendEmail(request) {
  // 1. Validate member can send to contact
  const canSend = await checkMemberContactRelation(member_id, contact_id)
  
  // 2. Render template with variables
  const rendered = await renderTemplate(template_id, {
    contact_name: contact.name,
    sender_name: member.name,
    ...customVariables
  })
  
  // 3. Add tracking pixels and links
  const tracked = addTracking(rendered, email_id)
  
  // 4. Queue for sending
  await resend.emails.send({
    from: `${member.name} <noreply@company.com>`,
    to: contact.email,
    subject: rendered.subject,
    html: tracked.html,
    text: rendered.text
  })
  
  // 5. Update database
  await updateEmailStatus(email_id, 'sent')
  
  // 6. Log interaction
  await logContactInteraction(contact_id, 'email_sent', { template_id })
}
Click Tracking Implementation
typescript// /api/track/click/[id] route
export async function GET(request, { params }) {
  const { id } = params
  const { url } = request.nextUrl.searchParams
  
  // Log click asynchronously
  logClick(id, url, request.headers)
  
  // Redirect to actual URL
  return NextResponse.redirect(url)
}

5. Training Academy {#training-academy}
Architecture Overview

Video Storage: Supabase Storage with CDN
Progress Tracking: Real-time sync across devices
Video Player: Custom wrapper around video.js
Adaptive Streaming: HLS for optimal bandwidth usage

Database Schema
sqltraining_courses:
- id (uuid)
- company_id (uuid, references companies)
- title (text)
- description (text)
- thumbnail_url (text)
- duration_minutes (int)
- order_index (int)
- is_required (boolean)
- created_at (timestamp)

course_videos:
- id (uuid)
- course_id (uuid, references training_courses)
- title (text)
- video_url (text)
- duration_seconds (int)
- order_index (int)

member_course_progress:
- member_id (uuid, references members)
- course_id (uuid, references training_courses)
- last_video_id (uuid, references course_videos)
- last_position_seconds (int)
- completed_videos (uuid[])
- completion_percentage (float)
- completed_at (timestamp)
- updated_at (timestamp)

-- Composite primary key
PRIMARY KEY (member_id, course_id)
API Design
GET /api/training/courses
jsonResponse:
{
  "courses": [
    {
      "id": "uuid",
      "title": "Getting Started",
      "thumbnail_url": "https://...",
      "duration_minutes": 45,
      "progress": {
        "percentage": 0.6,
        "last_video_id": "uuid",
        "last_position": 125
      }
    }
  ],
  "recommended_next": "uuid"
}
POST /api/training/progress
jsonRequest:
{
  "video_id": "uuid",
  "position_seconds": 125,
  "completed": false
}

Response:
{
  "progress": {
    "course_completion": 0.6,
    "videos_completed": 3,
    "total_videos": 5
  }
}
Video Player Implementation
typescript// Custom video player wrapper pseudocode
function TrainingVideoPlayer({ video, onProgress }) {
  const playerRef = useRef()
  const [lastSync, setLastSync] = useState(0)
  
  useEffect(() => {
    const player = videojs(playerRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      playbackRates: [0.5, 1, 1.5, 2]
    })
    
    // Sync progress every 10 seconds
    player.on('timeupdate', () => {
      const currentTime = player.currentTime()
      if (currentTime - lastSync > 10) {
        onProgress(currentTime)
        setLastSync(currentTime)
      }
    })
    
    // Mark complete at 90%
    player.on('ended', () => {
      const duration = player.duration()
      const watched = player.currentTime()
      if (watched / duration > 0.9) {
        onProgress(watched, true)
      }
    })
    
    return () => player.dispose()
  }, [video.id])
  
  return <video ref={playerRef} />
}
Progress Tracking Strategy
sql-- Function to calculate course completion
CREATE OR REPLACE FUNCTION calculate_course_completion(
  p_member_id uuid,
  p_course_id uuid
) RETURNS float AS $$
DECLARE
  total_videos int;
  completed_videos int;
BEGIN
  SELECT COUNT(*) INTO total_videos
  FROM course_videos
  WHERE course_id = p_course_id;
  
  SELECT array_length(completed_videos, 1) INTO completed_videos
  FROM member_course_progress
  WHERE member_id = p_member_id AND course_id = p_course_id;
  
  RETURN COALESCE(completed_videos::float / total_videos::float, 0);
END;
$$ LANGUAGE plpgsql;

6. Landing Pages & Funnels {#landing-pages-funnels}
Architecture Overview

Page Builder: Headless CMS approach with JSON schema
Routing: Dynamic catch-all routes with member subdomain/slug
Lead Capture: Direct to member's contacts with attribution
Analytics: First-party tracking with privacy compliance

Database Schema
sqllanding_pages:
- id (uuid)
- member_id (uuid, references members)
- slug (text)
- title (text)
- meta_description (text)
- template_id (uuid, references page_templates)
- content (jsonb) -- Page builder JSON
- is_published (boolean)
- created_at (timestamp)
- updated_at (timestamp)

-- Unique constraint for member + slug
UNIQUE(member_id, slug)

page_templates:
- id (uuid)
- company_id (uuid, references companies)
- name (text)
- thumbnail_url (text)
- schema (jsonb) -- Template structure
- default_content (jsonb)

funnels:
- id (uuid)
- member_id (uuid, references members)
- name (text)
- pages (uuid[]) -- Ordered array of landing_pages.id
- created_at (timestamp)

lead_captures:
- id (uuid)
- landing_page_id (uuid, references landing_pages)
- contact_id (uuid, references contacts)
- form_data (jsonb)
- ip_address (inet)
- user_agent (text)
- referrer (text)
- captured_at (timestamp)

page_visits:
- id (uuid)
- landing_page_id (uuid, references landing_pages)
- visitor_id (text) -- Anonymous ID
- referrer (text)
- utm_params (jsonb)
- visited_at (timestamp)
URL Structure & Routing
# Member subdomain approach
https://johndoe.company.com/my-opportunity

# OR path-based approach
https://company.com/m/johndoe/my-opportunity

# Affiliate link auto-redirect
https://company.com/ref/johndoe → member's default landing page
API Design
GET /api/pages/:slug
jsonResponse:
{
  "page": {
    "id": "uuid",
    "title": "Join My Team",
    "content": {
      "sections": [
        {
          "type": "hero",
          "props": {
            "headline": "Start Your Journey Today",
            "subheadline": "Join the fastest growing team",
            "cta_text": "Get Started",
            "cta_action": "show_form"
          }
        },
        {
          "type": "lead_form",
          "props": {
            "fields": ["name", "email", "phone"],
            "submit_text": "Request More Info"
          }
        }
      ]
    }
  }
}
POST /api/pages/:slug/capture
jsonRequest:
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "utm_source": "facebook",
  "utm_campaign": "spring2024"
}

Response:
{
  "success": true,
  "redirect_url": "/thank-you",
  "contact_id": "uuid"
}
Lead Attribution & Contact Creation
typescript// Lead capture processing pseudocode
async function processLeadCapture(pageId, formData, request) {
  // 1. Get page owner (member)
  const page = await getPageWithOwner(pageId)
  
  // 2. Check for duplicate contact
  const existing = await findContact(page.member_id, formData.email)
  
  if (existing) {
    // 3a. Update existing contact
    await addContactNote(existing.id, `Re-submitted form on ${page.title}`)
  } else {
    // 3b. Create new contact
    const contact = await createContact({
      member_id: page.member_id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: 'lead',
      source: `Landing Page: ${page.title}`,
      custom_fields: {
        utm_params: extractUTMParams(request),
        landing_page_id: pageId
      }
    })
  }
  
  // 4. Log capture for analytics
  await logLeadCapture(pageId, contact.id, formData)
  
  // 5. Trigger automation (if configured)
  await triggerAutomation('new_lead', { contact_id: contact.id })
}
Dynamic Page Rendering
typescript// Next.js dynamic route: /[username]/[slug]/page.tsx
export default async function LandingPage({ params }) {
  const { username, slug } = params
  
  // 1. Resolve member from username
  const member = await getMemberByUsername(username)
  if (!member) return notFound()
  
  // 2. Get page content
  const page = await getPublishedPage(member.id, slug)
  if (!page) return notFound()
  
  // 3. Track visit
  trackPageVisit(page.id, request)
  
  // 4. Render sections dynamically
  return (
    <PageLayout metadata={page.metadata}>
      {page.content.sections.map(section => (
        <DynamicSection
          key={section.id}
          type={section.type}
          props={section.props}
          memberId={member.id}
        />
      ))}
    </PageLayout>
  )
}
Page Builder Schema Example
json{
  "sections": [
    {
      "id": "hero_1",
      "type": "hero",
      "props": {
        "background_image": "url",
        "headline": "text",
        "subheadline": "text",
        "cta_text": "string",
        "cta_action": "enum:show_form|redirect|video"
      }
    },
    {
      "id": "form_1",
      "type": "lead_form",
      "props": {
        "fields": [
          {
            "name": "email",
            "type": "email",
            "label": "Email Address",
            "required": true
          }
        ],
        "submit_text": "Get Started",
        "success_message": "Thanks! We'll be in touch soon."
      }
    }
  ]
}

Global Considerations
Performance Optimizations

Database Indexes:
sqlCREATE INDEX idx_contacts_member_search ON contacts(member_id, name);
CREATE INDEX idx_activities_member_date ON member_activities(member_id, created_at DESC);
CREATE INDEX idx_pages_member_slug ON landing_pages(member_id, slug);

Caching Strategy:

Redis for session management
Edge caching for landing pages (Vercel Edge Config)
Browser cache for static training videos


Real-time Sync:

Supabase Realtime for dashboard updates
Optimistic UI updates with rollback on failure
Presence system for "active now" indicators



Security Implementation

RLS Policies for complete data isolation
API Rate Limiting per member: 100 requests/minute
Input Sanitization on all user-generated content
CSRF Protection via Next.js built-in features
Content Security Policy headers for XSS prevention

Mobile Responsiveness

Touch-optimized UI components (minimum 44px touch targets)
Progressive Web App configuration
Offline-first architecture with service workers
Responsive breakpoints: 640px, 768px, 1024px

This specification provides the complete technical blueprint for implementing the Network Marketing CRM with a simple, member-focused frontend that masks the complex multi-company hierarchical backend system.RetryACcan you give me the high end view of the app, who is it for and the main idea behind it please? also can you describe the user friendly dashboard and the vibe of the app taking into consideration the target audience. i want that app to be appealing for really not technical people so i want very intuitive designEditMapped out user-friendly CRM for network marketing professionals.5sThe user is asking for a high-level overview of the Network Marketing CRM app, including:

Who the target audience is
The main idea/purpose
Description of the user-friendly dashboard
The overall vibe/aesthetic
Focus on intuitive design for non-technical users

Based on the technical spec and UI descriptions, this is a Network Marketing CRM designed for MLM/network marketing team members. The key insight is that while the backend is complex (multi-company, hierarchical), the frontend is intentionally simple and friendly for everyday network marketers who aren't tech-savvy.
Let me craft a response that captures the essence of this app from a user experience perspective.Network Marketing CRM - High-Level Overview
🎯 Who It's For
This app is designed for network marketers and MLM team members - people who are building their business through personal relationships and team growth. These users are typically:

Not technical - They're relationship builders, not software experts
Busy entrepreneurs - Often juggling this business with other responsibilities
Mobile-first - Always on the go, meeting people, making connections
Motivated by growth - Want to see their progress and feel successful
Team-oriented - Success comes from helping others succeed

💡 The Main Idea
"Make network marketing feel as simple as texting a friend"
The app strips away all the complexity of traditional CRMs and focuses on three core activities:

Managing relationships (contacts)
Staying in touch (simple email templates)
Learning & growing (training videos)

While the backend handles complex multi-company hierarchies and compensation structures, the user never sees this complexity. They just see their contacts, their progress, and their next steps.
🏠 The Dashboard Experience
The Vibe: "Your Personal Success Hub"
Imagine opening an app that feels like:

A friendly coach - Always showing you what to do next
A celebration space - Your wins are highlighted and celebrated
A calm workspace - Never overwhelming, always clear

Visual Design Philosophy
Color Palette:

Soft, welcoming blues (trust, stability)
Energizing greens (growth, success)
Warm grays (professional but approachable)
Celebration gold (achievements, milestones)

Typography:

Large, readable fonts (18px minimum for body text)
Clear hierarchy - you always know what's most important
Friendly rounded fonts, not corporate sharp edges

Dashboard Layout
When users log in, they see:
1. Personal Greeting (Top)
"Good morning, Sarah! 🌟"
"You're doing great - 3 new contacts this week!"

Uses time-based greetings
Always positive and encouraging
Shows recent win/progress

2. Today's Focus (Center Stage)
Three big, colorful cards:
[📱] Contacts to Follow Up (3)
[✉️] Send a Quick Email
[🎓] Continue Training (15 min left)

Icons make actions instantly recognizable
Numbers create gentle urgency without stress
Each card is a one-click action

3. Your Progress (Visual & Motivating)

Weekly Streak: "🔥 5 days active this week!"
Growth Chart: Simple line going up (always framed positively)
Next Milestone: "Only 2 more contacts to reach Silver!"

4. Recent Wins (Social Proof)

"Jane replied to your email! 💬"
"You completed 'Mastering the First Call' 🎉"
"Tom (your contact) became a customer! 🎊"

🎨 Key UI/UX Principles
1. One-Thumb Navigation

Everything reachable with your thumb while holding your phone
Bottom navigation bar with just 4 big buttons:

Home | Contacts | Email | Learn



2. Zero Learning Curve

No training needed - if your grandma can use Facebook, she can use this
Every action has a clear, single button
No hidden menus or complex workflows

3. Celebration Over Administration

Adding a contact feels like a win (confetti animation!)
Sending an email shows instant "Sent! 🎉"
Completing training unlocks achievement badges

4. Smart Defaults

Pre-written email templates (just tap to send)
Auto-filled contact forms (just name & phone)
Suggested next actions based on time of day

5. Gentle Guidance

Never shame for inactivity ("Welcome back! Ready to grow?")
Soft reminders ("Sarah hasn't heard from you in a while")
Encouraging empty states ("Your first contact is your first success!")

📱 Mobile-First Features
Quick Actions (Floating Button)
A friendly "+" button that expands to:

📞 "Just talked to someone?" → Add Contact
💬 "Follow up time?" → Send Email
📝 "Take a note?" → Quick Note

Voice-First Options

"Hold to speak" for adding notes
Voice-to-text for contact names
Audio training summaries for driving

Offline Excellence

Works without internet (syncs later)
Never loses data
Shows friendly "We'll sync when you're back online!"

🌟 The Emotional Experience
Users should feel:

Confident: "I know exactly what to do next"
Supported: "The app is helping me succeed"
Accomplished: "Look at all I've done today!"
Connected: "My relationships are growing"

Never:

Overwhelmed by options
Confused by terminology
Ashamed of inactivity
Lost in navigation

🎯 Success Metrics From User's Perspective
The app subtly shows progress through:

Relationship Health: "You've touched base with 80% of your contacts this month! 🌟"
Growth Momentum: "Your network grew by 5 people this week!"
Learning Journey: "You're 60% through your training - almost there!"

🔮 The Magic
The true magic is what users DON'T see:

No complex hierarchies
No confusing compensation plans
No technical jargon
No overwhelming analytics
No administrative burden

Just:
✅ People to connect with
✅ Simple ways to stay in touch
✅ Bite-sized learning
✅ Celebration of progress

In Summary: This app takes the complex world of network marketing and makes it feel as natural as keeping in touch with friends. It's not a "business system" - it's a "success companion" that happens to handle all the business stuff invisibly in the background.