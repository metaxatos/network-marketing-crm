# Signup 500 Error - Troubleshooting Document

**Date**: June 20, 2025  
**Issue**: POST /api/auth/signup returns 500 Internal Server Error  
**Status**: 🔴 In Progress

## Problem Description
- User attempts to sign up on the production site (https://ourteam.gr)
- Browser shows 500 error when calling `/api/auth/signup`
- Previous fixes have been applied but error persists

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
1. Missing environment variables in production
2. Database connection issues
3. RLS policies blocking the operation
4. Error in the API route that prevents proper error response

## Actions Taken

### 1. Enhanced Error Handling
- Added comprehensive try-catch blocks throughout the signup route
- Added error handling for JSON parsing
- Added error handling for Supabase client creation
- Each operation now has its own error context

### 2. Added CORS Support
- Added CORS headers to all responses
- Added OPTIONS method handler
- This should help with any cross-origin issues

### 3. Updated API Helpers
- Modified `apiResponse` and `apiError` to support custom headers
- This allows proper CORS headers in all responses

### 4. Created Health Check Endpoint
- Created `/api/health-check` to verify:
  - API is accessible
  - Environment variables are set
  - Basic system status

### 5. Test Endpoints Created
- `/api/test-signup` - Tests Supabase connection and database access
- `/api/health-check` - Simple health check with environment info

## Next Steps

1. **Wait for deployment** (2-5 minutes)
2. **Test the health check endpoint**:
   ```bash
   curl https://ourteam.gr/api/health-check
   ```

3. **Test the test-signup endpoint**:
   ```bash
   curl https://ourteam.gr/api/test-signup
   ```

4. **Check Netlify Environment Variables**
   - Ensure all Supabase variables are properly set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

5. **Test the actual signup with verbose logging**:
   ```bash
   curl -X POST https://ourteam.gr/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}' \
     -v
   ```

## Possible Remaining Issues

### 1. Environment Variables
- The variables might not be set in Netlify
- Variable names might be different in production

### 2. Supabase Project Status
- The Supabase project might be paused
- API keys might have been rotated

### 3. Build Issues
- The build might be failing silently
- Dependencies might not be installed correctly

### 4. Network/Proxy Issues
- Netlify might be blocking certain requests
- There might be a proxy configuration issue

## Files Modified
1. `src/app/api/auth/signup/route.ts` - Enhanced error handling and CORS
2. `src/lib/api-helpers.ts` - Added header support
3. `src/app/api/health-check/route.ts` - New health check endpoint
4. `src/app/api/test-signup/route.ts` - Test endpoint (already existed)

## Status
Waiting for deployment to complete before testing the fixes.
