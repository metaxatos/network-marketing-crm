# Task 2: Email Click Tracking System

## Priority: 🔴 HIGH
## Estimated Time: 1-2 days
## Status: 📋 TODO

## Description
Implement email click tracking to measure engagement with sent emails. Focus only on click tracking (no open rate tracking as requested). This will help users understand which emails are effective and which contacts are engaging.

## Context
- Email system is already built with Resend integration
- Need to track clicks on links within emails
- User specifically requested NO open rate tracking
- Should provide analytics on click performance

## Acceptance Criteria

### Click Tracking Infrastructure
- [ ] Generate unique tracking links for each email sent
- [ ] Create redirect endpoint that logs clicks before redirecting
- [ ] Store click data with timestamp, IP, user agent
- [ ] Associate clicks with specific emails and contacts

### Email Link Processing
- [ ] Automatically wrap all links in emails with tracking URLs
- [ ] Preserve original URL functionality 
- [ ] Handle both HTML and text email versions
- [ ] Support multiple links per email

### Analytics Dashboard
- [ ] Show click statistics per email template
- [ ] Display click history for individual contacts
- [ ] Provide click-through rates by time period
- [ ] Export click data for analysis

### Database Schema
- [ ] Create `email_clicks` table with proper relationships
- [ ] Add indexes for performance
- [ ] Implement RLS policies for data security

## Technical Requirements

### Click Tracking Flow
1. Email sent with tracking links like: `/api/track/click/{emailId}?url={originalUrl}&linkId={linkPosition}`
2. User clicks link → redirect endpoint logs click → redirects to original URL
3. Click stored with metadata (timestamp, IP, contact info)
4. Analytics updated in real-time

### Link Wrapping
- [ ] Parse email HTML/text for links
- [ ] Replace with tracking URLs
- [ ] Maintain link text and styling
- [ ] Handle special cases (mailto, tel, etc.)

### Privacy & Security
- [ ] No personal data stored beyond necessary
- [ ] Anonymize IP addresses after 30 days
- [ ] Respect user privacy preferences
- [ ] Secure tracking URLs against tampering

## Implementation Steps

1. **Database Setup**
   - Create email_clicks table
   - Add tracking fields to sent_emails table
   - Set up proper indexes and RLS

2. **Link Processing**
   - Create utility to find and wrap links
   - Test with various email formats
   - Handle edge cases

3. **Tracking Endpoint**
   - Build `/api/track/click/[emailId]` route
   - Log click data
   - Implement redirect logic
   - Add error handling

4. **Analytics Interface**
   - Create click statistics components
   - Add to email dashboard
   - Build contact click history
   - Create export functionality

5. **Integration Testing**
   - Test with real emails
   - Verify tracking accuracy
   - Check analytics calculations

## Files to Create/Modify

### New Files
- `/src/app/api/track/click/[emailId]/route.ts` - Click tracking endpoint
- `/src/lib/email-tracking.ts` - Link processing utilities
- `/src/components/EmailAnalytics.tsx` - Analytics dashboard
- `/src/components/ClickHistory.tsx` - Contact click history

### Modified Files
- `/src/app/api/emails/send/route.ts` - Add link wrapping
- `/src/stores/emailStore.ts` - Add click analytics
- `/src/types/email.ts` - Add click tracking types
- Database schema updates

## Database Schema Updates

```sql
-- Email clicks tracking
CREATE TABLE email_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID REFERENCES sent_emails(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  link_position INTEGER,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_clicks_email_id ON email_clicks(email_id);
CREATE INDEX idx_email_clicks_contact_id ON email_clicks(contact_id);
CREATE INDEX idx_email_clicks_clicked_at ON email_clicks(clicked_at DESC);

-- RLS policies
ALTER TABLE email_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their email clicks" ON email_clicks
FOR SELECT USING (
  email_id IN (
    SELECT id FROM sent_emails 
    WHERE member_id = auth.uid()
  )
);
```

## Analytics Features

### Email Template Performance
- Click-through rate per template
- Most clicked links per template
- Best performing send times
- Template comparison charts

### Contact Engagement
- Click history timeline per contact
- Most engaged contacts list
- Engagement scoring based on clicks
- Follow-up suggestions based on clicks

### Campaign Analytics
- Total clicks per time period
- Link popularity rankings
- Geographic click data (optional)
- Device/browser analytics

## Success Criteria

### Functional Requirements
- [ ] All email links are automatically wrapped with tracking
- [ ] Clicks are logged accurately with metadata
- [ ] Users can view click analytics in dashboard
- [ ] Contact profiles show click history
- [ ] Click-through rates are calculated correctly

### Performance Requirements
- [ ] Redirect response time < 200ms
- [ ] Analytics queries load < 1 second
- [ ] No impact on email delivery speed
- [ ] Handles concurrent clicks efficiently

### User Experience
- [ ] Tracking is invisible to email recipients
- [ ] Original URLs work exactly as before
- [ ] Analytics are easy to understand
- [ ] No broken links or errors

## Testing Strategy

### Unit Tests
- Link parsing and wrapping functions
- Click data validation
- Analytics calculations

### Integration Tests
- End-to-end email sending with tracking
- Click logging and redirect flow
- Analytics dashboard accuracy

### Manual Testing
- Send test emails to various email clients
- Test link clicking from mobile/desktop
- Verify analytics accuracy

## Future Enhancements (Not in Scope)
- A/B testing of email content
- Heat maps of link positions
- Advanced segmentation by engagement
- Integration with marketing automation

## Dependencies
- Existing email system (Resend)
- Current database schema
- Analytics display components
- No new external dependencies needed 