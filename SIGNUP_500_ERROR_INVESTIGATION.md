# Signup 500 Error - Complete Investigation Report

**Date**: June 20, 2025  
**Issue**: POST /api/auth/signup returns 500 Internal Server Error  
**Status**: 🔴 Active Investigation

## Problem Summary
- Users cannot sign up on production site (https://ourteam.gr)
- API returns 500 error when calling `/api/auth/signup`
- Client shows "Auth loading timeout after 5 seconds" warning
- Simple test endpoints work, but signup endpoint fails

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

3. **Database Connectivity**:
   - `/api/simple-test` confirms connection works
   - Can query companies table (3 records)
   - Database logs show normal connection patterns

4. **RLS Policies on Members Table**:
   - ✅ "Anyone can check username availability" - SELECT allowed
   - ✅ "Anyone can check usernames" - SELECT allowed
   - ✅ "Members can update their own profile" - UPDATE with auth.uid() check
   - ✅ "Users can insert their own member record" - INSERT with auth.uid() = id check

### ❌ Failing Component

1. **Debug Signup Endpoint** (`/api/debug-signup`):
   - Returns HTTP 405 error
   - This suggests a routing or method handling issue

2. **Main Signup Endpoint** (`/api/auth/signup`):
   - Consistently returns 500 error
   - No specific error details in response

### 🔍 Key Findings

1. **No Error Logs**: 
   - Supabase API logs are empty
   - Auth logs are empty
   - This suggests the error occurs before reaching Supabase

2. **Security Advisors**: 
   - Multiple function search path warnings (non-critical)
   - Auth OTP expiry warning (non-critical)
   - Leaked password protection disabled (security recommendation)

3. **Database State**:
   - 3 existing users in auth.users table
   - Members table has proper RLS policies
   - No database-level errors logged

## Root Cause Analysis

The issue appears to be in the Next.js API route layer, not Supabase:

1. **Simple endpoints work** → Environment is configured correctly
2. **Database queries work** → Supabase connection is fine
3. **Debug endpoint fails with 405** → Suggests routing/handler issue
4. **No Supabase logs** → Error occurs before Supabase calls

## Actions Taken

### 1. Created Debug Endpoints ✅
- `/api/health-check` - Works correctly
- `/api/simple-test` - Works correctly  
- `/api/debug-signup` - Returns 405 error
- `/api/test-signup` - Previously created

### 2. Enhanced Error Handling ✅
- Added comprehensive try-catch blocks
- Added CORS headers
- Added detailed logging

### 3. Updated API Helpers ✅
- Modified to support custom headers
- Added proper error responses

### 4. Verified Infrastructure ✅
- Supabase project is healthy
- Database is accessible
- RLS policies are correct

## Next Steps

### Immediate Actions

1. **Check the API route imports**:
   The 405 error on debug-signup suggests the route might not be exporting functions correctly.

2. **Add a minimal test signup route**:
   ```typescript
   // src/app/api/minimal-signup/route.ts
   export async function POST(req: Request) {
     return Response.json({ test: "ok" })
   }
   ```

3. **Check for middleware interference**:
   Review `middleware.ts` to ensure it's not blocking API routes

4. **Enable Supabase Auth debug mode**:
   Check if email confirmations are required

### Debugging Strategy

1. **Test with curl directly**:
   ```bash
   curl -X POST https://ourteam.gr/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!"}' \
     -v
   ```

2. **Check browser network tab** for:
   - Request headers
   - Response headers
   - Exact error message

3. **Review Netlify function logs**:
   The error might be visible in Netlify's function logs

## Possible Solutions

1. **Route Export Issue**:
   Ensure all routes export named functions (GET, POST, etc.)

2. **Middleware Blocking**:
   Check if middleware is interfering with API routes

3. **Build/Deployment Issue**:
   The route might not be building correctly

4. **Request Size Limit**:
   Netlify has request size limits that might be hit

## Files Modified
1. `src/app/api/auth/signup/route.ts`
2. `src/lib/api-helpers.ts`
3. `src/app/api/health-check/route.ts`
4. `src/app/api/simple-test/route.ts`
5. `src/app/api/debug-signup/route.ts`

## Current Status
The issue is isolated to the Next.js API route layer. Simple endpoints work, but complex routes fail, suggesting a code or build issue rather than infrastructure problem.
