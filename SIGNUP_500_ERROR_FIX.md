# Signup 500 Error - Troubleshooting Document

**Date**: June 20, 2025  
**Issue**: POST /api/auth/signup returns 500 Internal Server Error  
**Status**: 🔴 In Progress

## Problem Description
- User attempts to sign up on the production site (https://ourteam.gr)
- Browser shows 500 error when calling `/api/auth/signup`
- The "Auth loading timeout after 5 seconds, proceeding without auth" warning appears before the error
- Previous fixes have been applied but error persists

## Investigation Steps

### Step 1: Review Current Code ✅
**Finding**: The signup API route is at `src/app/api/auth/signup/route.ts` and expects:
- Required: `email`, `password`
- Optional: `username`, `firstName`, `lastName`, `phone`, `companyId`, `sponsorId`

### Step 2: Check Production Environment ✅
**Finding**: Environment variables are properly set:
```json
{
  "nodeEnv": "production",
  "hasSupabaseUrl": true,
  "hasSupabaseAnonKey": true,
  "hasSupabaseServiceKey": true
}
```

### Step 3: Check Supabase Project Status ✅
**Finding**: Project "OurTeam 2.0" (ID: utvasathtyasoxelnxuf) is ACTIVE_HEALTHY
- URL: https://utvasathtyasoxelnxuf.supabase.co
- 3 companies exist in the database
- RLS is enabled on members table with proper policies

## Key Findings

1. **Client-Side Timeout**: The "Auth loading timeout after 5 seconds" suggests the client can't connect to Supabase
2. **Server has correct env vars**: The health check confirms all environment variables are set
3. **Database is accessible**: We can query the Supabase database directly
4. **RLS policies exist**: Including one that allows users to insert their own member record

## Possible Root Causes

### 1. Environment Variable Mismatch
The client and server might be using different Supabase projects. The client timeout suggests it can't reach the Supabase instance.

### 2. CORS or Network Issues
The client might be blocked from reaching Supabase directly.

### 3. Service Key vs Anon Key
The API route might need to use the service key for signup operations.

## Actions Taken

1. ✅ Enhanced error handling in signup route
2. ✅ Added CORS support
3. ✅ Updated API helpers to support headers
4. ✅ Created health check endpoint
5. ✅ Created simple test endpoint
6. ✅ Created debug signup endpoint

## Debug Endpoints Created

1. `/api/health-check` - Verifies environment variables
2. `/api/test-signup` - Tests Supabase connection
3. `/api/simple-test` - Basic Supabase connectivity test
4. `/api/debug-signup` - Detailed signup flow with logging

## Next Steps

1. **Wait for deployment** (2-3 minutes)

2. **Test the simple endpoint**:
   ```bash
   curl https://ourteam.gr/api/simple-test
   ```

3. **Test the debug signup**:
   ```bash
   curl -X POST https://ourteam.gr/api/debug-signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'
   ```

4. **Check browser console** for more details about the client-side timeout

5. **Verify Netlify environment variables** match the Supabase project:
   - NEXT_PUBLIC_SUPABASE_URL should be: https://utvasathtyasoxelnxuf.supabase.co
   - Ensure the anon key matches the project

## Temporary Workaround

While we debug, users can try:
1. Clearing browser cache and cookies
2. Using a different browser
3. Disabling browser extensions

## Files Modified
1. `src/app/api/auth/signup/route.ts` - Enhanced error handling and CORS
2. `src/lib/api-helpers.ts` - Added header support
3. `src/app/api/health-check/route.ts` - Environment check endpoint
4. `src/app/api/simple-test/route.ts` - Basic connectivity test
5. `src/app/api/debug-signup/route.ts` - Detailed signup debugging

## Status
Waiting for deployment of debug endpoints to isolate the exact cause of the 500 error.
