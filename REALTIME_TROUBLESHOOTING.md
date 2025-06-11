# Realtime Connection Issues - Troubleshooting Guide

## Issues Identified

Your application is experiencing several realtime connection problems:

1. **Multiple subscription error**: "tried to subscribe multiple times"
2. **WebSocket connection failures**: Connection closing before establishment
3. **Duplicate channel subscriptions**: Same channels being subscribed to multiple times

## Root Causes

### 1. Multiple Subscriptions to Same Channels
- `useDashboardRealtime()` and `useContactsRealtime()` were both subscribing to the `contacts` table
- This created conflicting subscriptions with identical channel names
- Supabase doesn't allow multiple subscriptions to the same channel

### 2. Callback Dependency Issues
- React hooks were including callback functions in dependency arrays
- Callbacks were recreated on every render, causing re-subscriptions
- This created a cycle of subscribe/unsubscribe events

### 3. Insufficient Channel Cleanup
- Previous channels weren't properly cleaned up before creating new ones
- Memory leaks from unclosed channels
- Stale connections persisting

## Fixes Implemented

### ✅ 1. Fixed Multiple Subscription Issue

**Before:**
```typescript
// Both hooks subscribing to same table with same channel names
useDashboardRealtime() // contacts_*_userId
useContactsRealtime()  // contacts_*_userId (CONFLICT!)
```

**After:**
```typescript
// Unique channel suffixes prevent conflicts
useDashboardRealtime() // contacts_*_userId_dashboard
useContactsRealtime()  // contacts_*_userId_contacts_crud
```

### ✅ 2. Stabilized Callback Functions

**Before:**
```typescript
useRealtimeSubscription('contacts', '*', (payload) => {
  // Inline function recreated on every render
}, [callback]) // ❌ Causes re-subscriptions
```

**After:**
```typescript
const stableCallback = useCallback((payload) => {
  // Stable callback reference
}, [])

useRealtimeSubscription('contacts', '*', stableCallback, {
  channelSuffix: 'dashboard'
})
```

### ✅ 3. Enhanced Channel Management

**Added:**
- Global channel tracking to prevent duplicates
- Automatic cleanup of existing channels before creating new ones
- Better error handling and logging
- Force cleanup utility for debugging

### ✅ 4. Improved Connection Monitoring

**Added:**
- Real WebSocket connection status monitoring
- Debug panel showing active channels
- Environment variable validation
- Connection retry logic

## Deployment-Specific Fixes

### For Netlify Deployment

1. **Environment Variables**
   ```bash
   # In Netlify dashboard, add these environment variables:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Build Settings**
   ```toml
   # In netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   
   [build.environment]
     NEXT_RUNTIME = "nodejs18.x"
   ```

3. **WebSocket Support**
   - Ensure your Netlify plan supports WebSocket connections
   - Check if your domain/subdomain has any WebSocket restrictions

### For Supabase Configuration

1. **Realtime Settings**
   ```sql
   -- Ensure tables are added to realtime publication
   ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.member_activities;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.sent_emails;
   ```

2. **Row Level Security**
   ```sql
   -- Ensure RLS policies allow SELECT access for realtime
   -- Example for contacts table:
   CREATE POLICY "Users can view own contacts" ON public.contacts
     FOR SELECT USING (auth.uid() = member_id);
   ```

3. **Database URL Format**
   ```
   # Ensure your Supabase URL is correct format:
   https://your-project-id.supabase.co
   
   # NOT:
   https://your-project-id.supabase.co/rest/v1/
   ```

## Testing & Verification

### 1. Use the Debug Panel

The application now includes a debug panel (purple lightning bolt in bottom-right):

- **Connection Status**: Shows realtime connection state
- **Active Channels**: Lists all currently subscribed channels
- **Environment Check**: Validates Supabase configuration
- **Test Actions**: Triggers realtime events for testing

### 2. Browser Console Monitoring

Look for these logs:
```javascript
// Good signs:
✅ Subscribed to contacts_*_userId_dashboard
🔗 Realtime connection status: CONNECTED

// Warning signs:
❌ Failed to subscribe to contacts_*_userId
🔄 Cleaning up existing channel: contacts_*_userId
⚠️ Many active channels detected
```

### 3. Network Tab Inspection

1. Open browser DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for successful WebSocket connection to Supabase
4. Connection should show "101 Switching Protocols" status

## Manual Fixes You Can Apply

### 1. Force Clear All Subscriptions

If you're still seeing multiple subscription errors:

```javascript
// In browser console:
import { cleanupAllChannels } from '@/lib/realtime'
cleanupAllChannels()
```

### 2. Check Environment Variables

```javascript
// In browser console:
console.log({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})
```

### 3. Restart Application

Sometimes a fresh start helps:
```bash
# Kill all Node processes
killall node

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Start fresh
npm run dev
```

## Expected Behavior After Fixes

### ✅ No More Multiple Subscription Errors
- Each subscription uses unique channel names
- No conflicts between dashboard and contact subscriptions

### ✅ Stable WebSocket Connection
- Connection establishes successfully
- Stays connected during normal usage
- Automatically reconnects on network issues

### ✅ Efficient Channel Management
- Only necessary channels are active
- Old channels are properly cleaned up
- Debug panel shows manageable number of channels (< 5)

### ✅ Real-time Updates Work
- Dashboard counters update when data changes
- Contact list updates immediately on add/edit/delete
- Activity feed shows new activities instantly

## Still Having Issues?

### 1. Check Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Verify URL and anon key are correct
- Check if realtime is enabled for your project

### 2. Verify Network
- Try from different network (mobile hotspot)
- Check if corporate firewall blocks WebSockets
- Test with VPN if necessary

### 3. Browser-Specific Issues
- Try different browser (Chrome, Firefox, Safari)
- Disable browser extensions temporarily
- Clear browser cache and cookies

### 4. Contact Support
If issues persist, provide:
- Browser console logs
- Network tab WebSocket errors
- Debug panel information
- Supabase project ID (without sensitive keys)

## Summary of Changes Made

1. **Fixed subscription conflicts** with unique channel suffixes
2. **Stabilized callback functions** to prevent re-subscriptions  
3. **Enhanced channel cleanup** and tracking
4. **Improved error handling** and logging
5. **Added comprehensive debugging tools**
6. **Better connection monitoring**

These changes should resolve the "tried to subscribe multiple times" error and WebSocket connection issues you were experiencing. 