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

### 1. Create Debug Endpoint
Creating a test endpoint to isolate the issue:

```typescript
// src/app/api/test-signup/route.ts
export async function GET() {
  return Response.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Test basic validation
    if (!body.email || !body.password) {
      return Response.json({ error: 'Missing email or password' }, { status: 400 })
    }
    
    // Test Supabase connection
    const supabase = await createApiClient(req)
    
    // Test database access
    const { data: companies, error: dbError } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
    
    if (dbError) {
      return Response.json({ 
        error: 'Database connection error',
        details: dbError.message 
      }, { status: 500 })
    }
    
    return Response.json({ 
      status: 'ready',
      hasCompanies: !!companies && companies.length > 0,
      receivedData: {
        email: body.email,
        hasPassword: !!body.password,
        fields: Object.keys(body)
      }
    })
    
  } catch (error: any) {
    return Response.json({ 
      error: 'Test endpoint error',
      message: error.message,
      type: error.constructor.name
    }, { status: 500 })
  }
}
```

### 2. Next Actions Required
1. Deploy the test endpoint
2. Test with: `curl -X POST https://ourteam.gr/api/test-signup -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'`
3. Based on the response, identify the exact issue
4. Apply the appropriate fix

## Possible Causes & Solutions

### 1. Environment Variables Missing
**Check**: Netlify environment variables
**Solution**: Ensure all required Supabase variables are set

### 2. Database Connection Issues
**Check**: Test endpoint response
**Solution**: Verify Supabase project is active and accessible

### 3. CORS Issues
**Check**: Browser console for CORS errors
**Solution**: Add proper CORS headers to API route

### 4. Request Body Parsing
**Check**: If body is being parsed correctly
**Solution**: Ensure Content-Type header is set properly

## Current Status
Waiting for test endpoint deployment to diagnose the exact issue.
