# Signup Issue Resolution Guide

## Problem
The signup endpoint returns a 500 Internal Server Error.

## Root Causes Identified

### 1. Database Schema Mismatch
- The API was trying to insert into `first_name` and `last_name` columns that no longer exist
- These were consolidated into a single `name` column during a migration

### 2. Missing RLS Policies
- The `members` table was missing an INSERT policy
- New users couldn't create their member records during signup

### 3. Potential Environment Variable Issues
The signup might still fail if the Netlify environment variables are not properly configured.

## Fixes Applied

### Database Fixes
```sql
-- Added INSERT policy for signup
CREATE POLICY "Users can insert their own member record" 
ON public.members 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Added policy for username checking
CREATE POLICY "Anyone can check usernames" 
ON public.members 
FOR SELECT 
USING (true);
```

### Code Fixes
1. Updated `src/app/api/auth/signup/route.ts`:
   - Changed from `first_name`/`last_name` to `name` field
   - Removed invalid `supabase.auth.admin.deleteUser` calls

## Required Environment Variables

Make sure these are set in Netlify:

1. Go to https://app.netlify.com/sites/ourteammlm/settings/env
2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://utvasathtyasoxelnxuf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Anon Key]
SUPABASE_SERVICE_ROLE_KEY=[Your Service Role Key - if needed]
```

## Testing

1. Check environment: https://ourteam.gr/api/debug/env
2. Test API connection: https://ourteam.gr/api/test
3. Try signup again

## Getting Supabase Keys

1. Go to https://app.supabase.com/project/utvasathtyasoxelnxuf/settings/api
2. Copy the anon key and service role key
3. Add them to Netlify environment variables
