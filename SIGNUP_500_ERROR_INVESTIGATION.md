# Signup 500 Error - Complete Investigation Report

**Date**: June 20, 2025  
**Issue**: POST /api/auth/signup returns 500 Internal Server Error  
**Status**: 🟡 ROUTES DEPLOYED - Debugging POST Handler

## Problem Summary
- Users cannot sign up on production site (https://ourteam.gr)
- API returns 500 error when calling `/api/auth/signup` 
- GET requests work correctly (return 405 with proper message)
- POST requests fail with 500 error

## Investigation Results

### ✅ Working Components

1. **Environment Variables** - All correctly set:
   - `NEXT_PUBLIC_SUPABASE_URL`: Set correctly
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Set correctly  
   - `SUPABASE_SERVICE_ROLE_KEY`: Set correctly

2. **Supabase Project Status**:
   - Project: OurTeam 2.0 (ID: utvasathtyasoxelnxuf)
   - Status: ACTIVE_HEALTHY
   - URL: https://utvasathtyasoxelnxuf.supabase.co
   - Database: PostgreSQL 17.4.1.041 running normally

3. **Route Deployment**:
   - All routes are deployed and accessible
   - GET handlers work correctly (return 405 for POST-only endpoints)
   - Basic test routes work: `/api/basic-test`, `/api/health-check`

4. **Database Connectivity**:
   - `/api/simple-test` confirms connection works
   - `/api/health-check` shows all environment variables are set
   - Database is accessible

### ❌ Current Issue

**POST Handler Failure**:
- GET requests to signup endpoints correctly return: `{"message":"This endpoint only accepts POST requests"}`
- POST requests to signup endpoints return 500 error
- This indicates the route is deployed but the POST handler is failing

### 🔍 Key Findings

1. **Routes Are Deployed**:
   - `/api/auth/signup` - GET works, POST fails
   - `/api/auth/signup-v2` - GET works, POST fails
   - `/api/basic-test` - GET works perfectly
   - `/api/health-check` - Shows all env vars are set

2. **Issue is in POST Handler**:
   - The problem occurs when processing POST requests
   - Likely issues:
     - Request body parsing
     - Supabase client initialization
     - Import resolution in production

## Actions Taken

### 1. Created Multiple Test Endpoints ✅
- `/api/health-check` - Works, shows env vars are set
- `/api/simple-test` - Database connection test
- `/api/basic-test` - No imports, works perfectly
- `/api/auth/signup-v2` - Simplified signup without helpers
- `/api/debug-signup-test` - Detailed logging endpoint
- `/test-signup` - Frontend test page for debugging

### 2. Fixed Type Compatibility ✅
- Updated all routes to use standard `Request` type
- Updated `createApiClient` to accept both types
- Removed dependency on `NextRequest`

### 3. Verified Deployment ✅
- Netlify deployment successful
- Routes are accessible
- GET handlers work correctly

## Current Debugging Status

The routes are deployed but POST handlers are failing. Need to:

1. **Test with the debug endpoint** (`/api/debug-signup-test`) to identify exactly where the failure occurs
2. **Check Netlify Function logs** for runtime errors
3. **Test simplified endpoints** to isolate the issue

## Test Commands

```bash
# Test basic endpoint (should work)
curl -X POST https://ourteam.gr/api/basic-test \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  -v

# Test debug endpoint (detailed logging)
curl -X POST https://ourteam.gr/api/debug-signup-test \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  -v

# Test simplified signup
curl -X POST https://ourteam.gr/api/auth/signup-v2 \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  -v
```

## Next Steps

1. **Access the test page**: Go to `https://ourteam.gr/test-signup` once deployed
2. **Check Netlify Function logs**: Look for runtime errors in the Netlify dashboard
3. **Test each endpoint systematically** to find which component is failing
4. **Consider Edge Runtime issues**: Next.js 14 with Netlify might have edge runtime compatibility issues

## Files Modified
1. `src/app/api/auth/signup/route.ts` - Updated to use standard Request type
2. `src/lib/api-helpers.ts` - Original helpers
3. `src/app/api/health-check/route.ts` - Shows env vars are set
4. `src/app/api/simple-test/route.ts` - Database connection test
5. `src/app/api/basic-test/route.ts` - No imports test
6. `src/app/api/auth/signup-v2/route.ts` - Simplified signup
7. `src/lib/supabase/api-client.ts` - Accepts both Request types
8. `src/app/api/debug-signup-test/route.ts` - Detailed debugging
9. `src/app/test-signup/page.tsx` - Frontend test page

## Hypothesis

The issue appears to be with:
1. **Import resolution in production** - The module imports might fail in Netlify's runtime
2. **Request parsing** - The body parsing might fail in the edge runtime
3. **Supabase client initialization** - The client creation might fail with standard Request

The fact that basic routes work but complex ones fail suggests an issue with imports or async operations in the Netlify environment.
