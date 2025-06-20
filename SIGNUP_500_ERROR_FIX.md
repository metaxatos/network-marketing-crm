# Signup 500 Error - Troubleshooting Document

**Date**: June 20, 2025  
**Issue**: POST /api/auth/signup returns 500 Internal Server Error  
**Status**: 🔴 In Progress

## Problem Description
- User attempts to sign up on the production site (https://ourteam.gr)
- Browser shows 500 error when calling `/api/auth/signup`
- Previous fixes have been applied but error persists
- The "Auth loading timeout after 5 seconds" warning appears before the error

## Investigation Steps

### Step 1: Review Current Code
**Finding**: The signup API route is at `src/app/api/auth/signup/route.ts` and expects:
- Required: `email`, `password`
- Optional: `username`, `firstName`, `lastName`, `phone`, `companyId`, `sponsorId`

The API route:
1. Creates auth user via Supabase Auth
2. Gets default company if none provided
3. Creates member record with combined `name` field (firstName + lastName)

### Step 2: Check API Route Logs
The route has detailed logging but we're getting a 500 error without seeing these logs in the response.

### Step 3: Check Production Environment
**Issue**: The 500 error might be due to:
1. Missing environment variables in production ✅ **VERIFIED: Variables are set correctly**
2. Database connection issues ❓ **TO BE TESTED**
3. RLS policies blocking the operation ❓ **TO BE TESTED**
4. Error in the API route that prevents proper error response ❓ **TO BE TESTED**

## Actions Taken

### 1. Enhanced Error Handling ✅
- Added comprehensive try-catch blocks throughout the signup route
- Added error handling for JSON parsing
- Added error handling for Supabase client creation
- Each operation now has its own error context

### 2. Added CORS Support ✅
- Added CORS headers to all responses
- Added OPTIONS method handler
- This should help with any cross-origin issues

### 3. Updated API Helpers ✅
- Modified `apiResponse` and `apiError` to support custom headers
- This allows proper CORS headers in all responses

### 4. Created Health Check Endpoint ✅
- Created `/api/health-check` to verify:
  - API is accessible
  - Environment variables are set
  - Basic system status

### 5. Test Endpoints Created ✅
- `/api/test-signup` - Tests Supabase connection and database access
- `/api/health-check` - Simple health check with environment info

## Current Findings

### Health Check Results ✅
```json
{
  "status": "ok",
  "timestamp": "2025-06-20T10:54:10.073Z",
  "environment": {
    "nodeEnv": "production",
    "hasSupabaseUrl": true,
    "hasSupabaseAnonKey": true,
    "hasSupabaseServiceKey": true,
    "url": "SET"
  }
}
```
**Conclusion**: Environment variables are properly set.

### Error Details
- Browser shows: "Auth loading timeout after 5 seconds, proceeding without auth"
- This suggests the client-side Supabase initialization might be timing out
- The 500 error occurs when POST to `/api/auth/signup`

## Next Steps

1. **Test the test-signup endpoint** to check Supabase connection:
   ```bash
   curl https://ourteam.gr/api/test-signup
   ```

2. **Test with curl to get more details**:
   ```bash
   curl -X POST https://ourteam.gr/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}' \
     -v
   ```

3. **Check Supabase Project Status**:
   - Verify the project is active (not paused)
   - Check if there are any service outages
   - Verify RLS policies on the members table

4. **Check Client-Side Issues**:
   - The "Auth loading timeout" suggests client-side Supabase initialization issues
   - This might be related to CORS or network connectivity

## Possible Remaining Issues

### 1. Supabase Connection
- The Supabase project might be paused
- API keys might have been rotated
- RLS policies might be blocking the operation

### 2. Client-Side Configuration
- The client might be using different environment variables
- CORS issues between client and server

### 3. Network/Proxy Issues
- Netlify might be blocking certain requests
- There might be a proxy configuration issue

## Files Modified
1. `src/app/api/auth/signup/route.ts` - Enhanced error handling and CORS
2. `src/lib/api-helpers.ts` - Added header support
3. `src/app/api/health-check/route.ts` - New health check endpoint
4. `src/app/api/test-signup/route.ts` - Test endpoint (already existed)

## Status
Environment variables are confirmed to be set. Need to test Supabase connection and check for RLS policy issues.
