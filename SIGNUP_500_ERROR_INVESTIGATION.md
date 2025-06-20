# Signup 500 Error - Complete Investigation Report

**Date**: June 20, 2025  
**Issue**: POST /api/auth/signup returns 500 Internal Server Error  
**Status**: ⚠️ NEW ISSUE FOUND - RLS Policy Violation (Fix Implemented)

## Problem Summary
- Users cannot sign up on production site (https://ourteam.gr)
- API returns 500 error with message: `"Failed to create member profile: new row violates row-level security policy for table \"members\""`
- **Root Cause**: The signup API route is using the anon key which is subject to RLS policies, but there's no authenticated session during signup

## Investigation Update (June 20, 2025)

### New Issue Discovered
While the email validation issue was resolved, a new problem has been discovered:

1. **Error Message**: `"Failed to create member profile: new row violates row-level security policy for table \"members\""`
2. **Root Cause**: The API route is using the Supabase anon key, not the service role key
3. **RLS Policy**: The `members` table has a policy "Users can insert their own member record" with condition `auth.uid() = id`
4. **Problem**: During signup from the API route, there's no authenticated session, so `auth.uid()` is null

### Technical Analysis

#### Current RLS Policies on `members` table:
```sql
-- "Users can insert their own member record"
-- WITH CHECK: (auth.uid() = id)
```

This policy requires that the authenticated user's ID matches the ID being inserted. However, during signup:
1. The auth user is created first
2. Then the member record is created
3. But the API route doesn't have an authenticated session, so `auth.uid()` is null

#### Current Implementation Issue:
The `createApiClient` function in `src/lib/supabase/api-client.ts` uses:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (subject to RLS)
- Should use: `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)

## Resolution

### ✅ Fix Implemented

1. **Created Admin Client** (`src/lib/supabase/admin-client.ts`):
   - Uses service role key to bypass RLS
   - Only for server-side admin operations
   - Includes safety checks and validation

2. **Updated Signup Route** (`src/app/api/auth/signup/route.ts`):
   - Uses regular client for auth.signUp
   - Uses admin client for member creation
   - Checks if service role key is available

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

### Alternative Solutions

1. **Modify RLS Policy** (Not recommended for security):
   - Could add a policy that allows inserts without authentication
   - Security risk: anyone could insert members

2. **Use Database Function** (Better alternative):
   - Create a PL/pgSQL function that handles the entire signup process
   - Function runs with SECURITY DEFINER (elevated privileges)
   - Single atomic operation

3. **Two-Step Process** (Current workaround):
   - User signs up (creates auth user)
   - User logs in (gets session)
   - Create member profile with authenticated session

## Environment Variables Required

Make sure these are set in Netlify:
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (already set)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (already set)
- `SUPABASE_SERVICE_ROLE_KEY` ❌ (needs to be added)

## Test Results

### ✅ Working Tests
- `/api/basic-test` - POST requests work perfectly
- Auth user creation works
- All environment variables for basic operations are correctly set
- Database connection is working

### ❌ What Fails (Before Fix)
- Member record creation due to RLS policy violation
- Any operation that requires inserting into `members` table without authentication

### ✅ What Will Work (After Adding Service Role Key)
- Complete signup flow
- Member record creation using admin privileges
- All signup operations

## Files Modified

1. ✅ Created `src/lib/supabase/admin-client.ts` - Admin client with service role key
2. ✅ Updated `src/app/api/auth/signup/route.ts` - Use admin client for member creation
3. ❌ Netlify environment variables - Need to add service role key

## Security Considerations

- **Service role key bypasses all RLS policies**
- Should only be used for specific admin operations
- Never expose service role key to client-side code
- Keep it in server-side environment variables only
- The admin client is only used for member creation during signup

## Investigation Timeline

1. **Initial Issue**: 500 errors on signup
2. **First Hypothesis**: Type compatibility issues with Next.js 14
3. **Fix Applied**: Updated all routes to use standard `Request` type
4. **Deployment**: Successfully deployed to Netlify
5. **Testing**: Created test endpoints and pages
6. **Discovery**: API works but Supabase rejects test emails
7. **Resolution**: Use realistic email addresses
8. **New Issue**: RLS policy violation when creating member records
9. **Root Cause**: API using anon key instead of service role key
10. **Fix Implemented**: Created admin client and updated signup route
11. **Action Required**: Add service role key to Netlify

## Lessons Learned

1. **RLS Policies**: Always consider how RLS policies affect server-side operations
2. **Service Role Key**: Essential for admin operations that bypass RLS
3. **Auth Flow**: Signup is a special case that requires elevated privileges
4. **Environment Variables**: Different keys serve different purposes
5. **Error Messages**: RLS violations provide clear error messages

## Next Steps

1. Add `SUPABASE_SERVICE_ROLE_KEY` to Netlify environment variables
2. Redeploy the site
3. Test signup with realistic email addresses
4. Verify member records are created successfully

The signup system is now properly configured to use the service role key for bypassing RLS policies during member creation. Once the environment variable is added to Netlify, the signup flow should work correctly.