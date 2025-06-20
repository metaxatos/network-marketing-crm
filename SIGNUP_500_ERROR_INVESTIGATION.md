# Signup 500 Error - Complete Investigation Report

**Date**: June 20, 2025  
**Issue**: POST /api/auth/signup returns 500 Internal Server Error  
**Status**: ⚠️ NEW ISSUE FOUND - RLS Policy Violation

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

### Immediate Fix
Create a separate Supabase client for admin operations that uses the service role key:

1. Create `src/lib/supabase/admin-client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

2. Update the signup route to use the admin client for member creation:
```typescript
// Use regular client for auth.signUp
const supabase = await createApiClient(req)
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
})

// Use admin client for member creation (bypasses RLS)
const adminClient = createAdminClient()
const { data: member, error: memberError } = await adminClient
  .from('members')
  .insert([memberData])
  .select()
  .single()
```

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
- `SUPABASE_SERVICE_ROLE_KEY` ❓ (needs to be added)

## Test Results

### ✅ Working Tests
- `/api/basic-test` - POST requests work perfectly
- Auth user creation works
- All environment variables for basic operations are correctly set
- Database connection is working

### ❌ What Fails
- Member record creation due to RLS policy violation
- Any operation that requires inserting into `members` table without authentication

## Recommendations

1. **Immediate Action**: Add `SUPABASE_SERVICE_ROLE_KEY` to Netlify environment variables
2. **Security Best Practice**: Only use service role key for specific admin operations
3. **Code Update**: Implement the admin client approach for signup
4. **Long-term**: Consider implementing a database function for atomic signup

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

## Files to Modify

1. Create `src/lib/supabase/admin-client.ts` - Admin client with service role key
2. Update `src/app/api/auth/signup/route.ts` - Use admin client for member creation
3. Update `.env.local` - Add `SUPABASE_SERVICE_ROLE_KEY`
4. Update Netlify environment variables - Add service role key

## Security Considerations

- Service role key bypasses all RLS policies
- Should only be used for specific admin operations
- Never expose service role key to client-side code
- Keep it in server-side environment variables only

## Lessons Learned

1. **RLS Policies**: Always consider how RLS policies affect server-side operations
2. **Service Role Key**: Essential for admin operations that bypass RLS
3. **Auth Flow**: Signup is a special case that requires elevated privileges
4. **Environment Variables**: Different keys serve different purposes
5. **Error Messages**: RLS violations provide clear error messages

The signup system requires the service role key to bypass RLS policies during member creation.