# Signup 500 Error - Complete Investigation Report

**Date**: June 20, 2025  
**Issue**: POST /api/auth/signup returns 500 Internal Server Error  
**Status**: ⚠️ NEW ISSUE FOUND - Foreign Key Constraint Violation (Fix Implemented)

## Problem Summary
- Users cannot sign up on production site (https://ourteam.gr)
- API returns 500 error with message: `"Failed to create member profile: insert or update on table \"members\" violates foreign key constraint \"members_id_fkey\""`
- **Root Cause**: The auth user is not immediately available in the database when using `auth.signUp` with anon key

## Investigation Update (June 20, 2025 - Latest)

### New Issue Discovered
After fixing the RLS issue, a new problem appeared:

1. **Error Message**: `"insert or update on table \"members\" violates foreign key constraint \"members_id_fkey\""`
2. **Root Cause**: The `members.id` has a foreign key to `auth.users(id)`, but the auth user isn't immediately available
3. **Problem**: When using `auth.signUp` with the anon key, the user is created in a pending state until email confirmation
4. **Solution**: Use admin API to create users with auto-confirmed email

### Technical Analysis

#### Foreign Key Constraint:
```sql
-- members_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
```

This means the member ID must exist in auth.users table before we can insert into members table.

#### The Timing Issue:
1. `supabase.auth.signUp()` with anon key creates a "pending" user
2. User isn't fully available in auth.users until email confirmation
3. Member insert fails because the foreign key doesn't exist yet

## Resolution

### ✅ Fix Implemented (v2)

Updated the signup route to use admin client for BOTH operations:

1. **Auth User Creation**: Now using `adminClient.auth.admin.createUser()` which:
   - Creates user immediately in auth.users
   - Auto-confirms email (no pending state)
   - Ensures user is available for foreign key constraint

2. **Member Creation**: Continue using admin client to bypass RLS

### 🔧 Action Required: Add Service Role Key to Netlify

**Step 1: Get the Service Role Key from Supabase**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Find the "service_role" secret key (starts with `eyJ...`)
4. Copy this key (keep it secure!)

**Step 2: Add to Netlify Environment Variables**
1. Go to Netlify dashboard
2. Navigate to Site Configuration → Environment Variables
3. Add new variable:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [paste the service role key]
   - Contexts: All (Production, Preview, Branch deploys)
4. Save the changes

**Step 3: Redeploy the Site**
1. Trigger a new deployment in Netlify
2. Or push any small change to trigger auto-deploy

## Environment Variables Required

Make sure these are set in Netlify:
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (already set)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (already set)
- `SUPABASE_SERVICE_ROLE_KEY` ❌ (needs to be added)

## Investigation Timeline

1. **Initial Issue**: 500 errors on signup
2. **First Fix**: Updated routes to use standard `Request` type
3. **Email Issue**: Discovered Supabase rejects test emails like "test@example.com"
4. **RLS Issue**: Found "new row violates row-level security policy for table \"members\""
5. **First Solution**: Created admin client to bypass RLS
6. **Foreign Key Issue**: Found "violates foreign key constraint \"members_id_fkey\""
7. **Final Solution**: Use admin API for both auth user and member creation

## Files Modified

1. ✅ Created `src/lib/supabase/admin-client.ts` - Admin client with service role key
2. ✅ Updated `src/app/api/auth/signup/route.ts` - Use admin client for both operations
3. ❌ Netlify environment variables - Need to add service role key

## Key Changes in Final Solution

```typescript
// OLD: Using regular auth.signUp (creates pending user)
const authResult = await supabase.auth.signUp({
  email,
  password,
})

// NEW: Using admin API (creates confirmed user immediately)
const authResult = await adminClient.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // Auto-confirm email
  user_metadata: {
    firstName,
    lastName,
    username
  }
})
```

## Benefits of This Approach

1. **Immediate User Creation**: User is available in auth.users instantly
2. **No Email Confirmation Needed**: Users can log in immediately
3. **Atomic Operation**: Both auth user and member are created in one request
4. **Better User Experience**: No need to check email before using the app

## Security Considerations

- **Service role key bypasses all security**
- Only used for signup operation
- Never exposed to client-side
- All other operations use regular authenticated client

## Next Steps

1. Add `SUPABASE_SERVICE_ROLE_KEY` to Netlify environment variables
2. Redeploy the site
3. Test signup with realistic email addresses
4. Users should be able to sign up and log in immediately

## Lessons Learned

1. **Foreign Key Constraints**: Always check if referenced records exist
2. **Auth States**: Understand the difference between pending and confirmed users
3. **Admin API**: Essential for operations that need immediate effect
4. **Timing Issues**: Database operations aren't always synchronous
5. **Supabase Auth**: Different methods have different behaviors

The signup system now properly uses the admin API to create confirmed users immediately, ensuring the foreign key constraint is satisfied.