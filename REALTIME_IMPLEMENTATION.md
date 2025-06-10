# Realtime Updates Implementation

This document outlines the complete implementation of realtime updates using Supabase Realtime for the Network Marketing CRM.

## Overview

The realtime system provides live updates for:
- Dashboard statistics (contact count, email count, activity count)
- Contact management (add, update, delete)
- Activity feed (new activities appear instantly)
- Connection status monitoring

## Architecture

### Core Components

1. **Realtime Library** (`src/lib/realtime.ts`)
   - Connection management
   - Subscription utilities
   - Update batching
   - Debouncing

2. **Realtime Hooks** (`src/hooks/useRealtime.ts`)
   - `useRealtimeSubscription` - Single table subscription
   - `useMultipleRealtimeSubscriptions` - Multiple table subscriptions
   - `useDashboardRealtime` - Dashboard-specific updates
   - `useActivityFeedRealtime` - Activity feed updates
   - `useRealtimeConnection` - Connection status monitoring

3. **Contact Integration** (`src/hooks/useContactsRealtime.ts`)
   - Integrates with contact store
   - Handles contact CRUD operations via realtime

### Database Tables

The system requires these tables with realtime enabled:

```sql
-- Core tables (already existing)
public.contacts
public.members
public.member_profiles

-- Additional tables (created by realtime-tables.sql)
public.member_activities
public.sent_emails
public.email_clicks
public.email_templates
```

## Setup Instructions

### 1. Database Setup

Run the SQL files in order:

```bash
# 1. Run main database setup
psql -h your-db-host -U your-user -d your-db -f database/setup.sql

# 2. Run realtime tables setup
psql -h your-db-host -U your-user -d your-db -f database/realtime-tables.sql
```

### 2. Enable Realtime in Supabase

Ensure realtime is enabled for these tables in your Supabase dashboard:
- `public.contacts`
- `public.member_activities`
- `public.sent_emails`

### 3. Environment Variables

Make sure your Supabase configuration is correct in `src/lib/config.ts`:

```typescript
export const config = {
  database: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }
}
```

## Usage

### Dashboard Integration

The dashboard automatically uses realtime updates:

```typescript
import { useDashboardRealtime, useRealtimeConnection } from '@/hooks/useRealtime'
import { useContactsRealtime } from '@/hooks/useContactsRealtime'

export default function DashboardPage() {
  // Get live dashboard metrics
  const { contactCount, emailCount, activityCount } = useDashboardRealtime()
  
  // Monitor connection status
  const { isConnected, isReconnecting } = useRealtimeConnection()
  
  // Enable contact realtime updates
  useContactsRealtime()

  // Use contactCount, emailCount, activityCount in your UI
  // Display connection status if needed
}
```

### Contact Management

Contacts automatically sync via realtime:

```typescript
import { useContactsRealtime } from '@/hooks/useContactsRealtime'

export default function ContactsPage() {
  // This enables automatic realtime updates for contacts
  useContactsRealtime()
  
  // Your existing contact store will automatically update
  // when contacts are added, updated, or deleted
}
```

### Activity Feed

Real-time activity updates:

```typescript
import { useActivityFeedRealtime } from '@/hooks/useRealtime'

export default function ActivityFeed() {
  const { 
    activities, 
    newActivityCount, 
    markActivityAsSeen 
  } = useActivityFeedRealtime()

  return (
    <div>
      {newActivityCount > 0 && (
        <div onClick={markActivityAsSeen}>
          {newActivityCount} new activities
        </div>
      )}
      {activities.map(activity => (
        <div key={activity.id}>{activity.description}</div>
      ))}
    </div>
  )
}
```

## Features

### 1. Live Dashboard Statistics

- Contact count updates when contacts are added/deleted
- Email count updates when emails are sent
- Activity count updates when new activities are logged
- Connection status indicator shows realtime health

### 2. Real-time Contact Management

- New contacts appear instantly across all sessions
- Contact updates sync immediately
- Contact deletions remove items from all open sessions
- Optimistic updates with fallback to realtime sync

### 3. Activity Feed

- New activities appear with animation
- "New activity" counter with click-to-dismiss
- Activity descriptions are formatted automatically
- Batch updates prevent UI flickering

### 4. Connection Management

- Automatic reconnection on network issues
- Connection status indicators
- Graceful fallback when realtime is unavailable
- Debug information in development mode

## Development Tools

### Test Panel

In development mode, a test panel is available to trigger realtime updates:

```typescript
// Automatically included in dashboard during development
{process.env.NODE_ENV === 'development' && <RealtimeTestPanel />}
```

The test panel allows you to:
- Add test contacts
- Create test activities
- Monitor connection status
- View realtime logs

### Debugging

Enable detailed logging by checking the browser console:

```javascript
// Subscription confirmations
✅ Subscribed to contacts_INSERT_user-id

// Activity updates
🎯 Test activity created - should trigger realtime update

// Connection status
🔌 Unsubscribed from contacts_INSERT_user-id
```

## Performance Considerations

### 1. Subscription Management

- Subscriptions are automatically cleaned up on component unmount
- Multiple subscriptions to the same table are avoided
- Filters ensure users only receive their own data

### 2. Update Batching

- Rapid updates are batched to prevent UI flickering
- Configurable debounce delays (default 300ms)
- Manual flush capability for immediate updates

### 3. Memory Management

- Activity feeds are limited to recent items (10 by default)
- Old activities are automatically pruned
- Connection instances are shared across components

## Security

### Row Level Security (RLS)

All realtime tables have RLS policies:

```sql
-- Users only see their own data
CREATE POLICY "Users can view their own activities" ON member_activities
    FOR SELECT USING (auth.uid() = member_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert their own activities" ON member_activities
    FOR INSERT WITH CHECK (auth.uid() = member_id);
```

### Data Filtering

- Realtime subscriptions include member_id filters
- Server-side validation ensures data integrity
- Client-side validation provides immediate feedback

## Troubleshooting

### Common Issues

1. **Realtime not working**
   - Check if tables are added to supabase_realtime publication
   - Verify RLS policies allow SELECT access
   - Confirm environment variables are set

2. **Connection issues**
   - Check network connectivity
   - Verify Supabase URL and keys
   - Look for CORS issues in browser console

3. **Updates not appearing**
   - Ensure filters match data being updated
   - Check if RLS policies are too restrictive
   - Verify user authentication status

### Debug Commands

```sql
-- Check if tables are in realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check recent activities
SELECT * FROM member_activities 
WHERE member_id = 'user-id' 
ORDER BY created_at DESC 
LIMIT 10;
```

## API Endpoints

### Activities

- `GET /api/dashboard/activities` - Get user activities
- `POST /api/dashboard/activities` - Create new activity

### Contacts

- `GET /api/contacts` - Get user contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact

## Future Enhancements

### Planned Features

1. **Email Realtime**
   - Live email open/click tracking
   - Real-time delivery status updates
   - Template performance metrics

2. **Team Collaboration**
   - Shared team activities
   - Real-time commenting
   - Live presence indicators

3. **Advanced Notifications**
   - Push notifications for important events
   - Email digests of realtime activity
   - Custom notification preferences

### Optimization Opportunities

1. **Selective Updates**
   - Update only changed fields
   - Delta synchronization
   - Conflict resolution

2. **Advanced Caching**
   - Local storage persistence
   - Background sync
   - Offline support

3. **Performance Monitoring**
   - Realtime metrics dashboard
   - Connection quality monitoring
   - Usage analytics

## Conclusion

The realtime system provides a smooth, responsive user experience with live updates across all data types. The modular architecture makes it easy to extend to new features while maintaining performance and security.

For questions or issues, check the browser console for detailed logging information and refer to the troubleshooting section above. 