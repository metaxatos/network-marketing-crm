# Signup 500 Error - Troubleshooting Document

**Date**: June 20, 2025  
**Issue**: POST /api/auth/signup returns 500 Internal Server Error  
**Status**: 🔴 In Progress

## Problem Description
- User attempts to sign up
- Browser shows 500 error when calling `/api/auth/signup`
- Previous fixes have been applied but error persists

## Investigation Steps

### Step 1: Check How Signup is Called
**Finding**: The userStore.ts sends the data with camelCase field names:
```javascript
body: JSON.stringify({ 
  email, 
  password, 
  firstName: memberData.first_name,  // Converting from snake_case to camelCase
  lastName: memberData.last_name,    // Converting from snake_case to camelCase
  username: memberData.username,
  phone: memberData.phone,
  companyId: memberData.companyId,
  sponsorId: memberData.sponsorId,
})
```

**Issue**: The signup form is sending `first_name` and `last_name` but the API expects `firstName` and `lastName`.

### Step 2: Review Current Database Schema
**Finding**: The members table has:
- A single `name` column (not `first_name` and `last_name`)
- The API route correctly combines firstName + lastName into name

### Step 3: Previous Fixes Applied
1. ✅ Removed invalid `supabase.auth.admin.deleteUser` call
2. ✅ Added explicit `position: null` field
3. ✅ Updated route to combine firstName/lastName into name field
4. ✅ Added RLS policies for INSERT operations

### Step 4: Current Status
**Problem**: The request is reaching the API but still returning 500 error
**Next Steps**: 
1. Deploy test endpoint to check exact error
2. Check if deployment has completed
3. Verify all changes are live

## Actions Taken

### Created Test Endpoint
- Created `/api/test-signup` to debug the issue
- This will help identify the exact error without going through the full signup flow

### Next Actions Required
1. Wait for deployment (typically 2-5 minutes)
2. Test the `/api/test-signup` endpoint
3. Based on the error, apply the fix
