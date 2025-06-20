# Action Plan to Fix Signup Issue

## Current Status
The signup is failing with a 500 error. We've fixed the code issues, but the deployment hasn't succeeded yet.

## Step 1: Add Supabase Environment Variables to Netlify

**This is the most likely cause of the 500 error!**

1. Go to https://app.netlify.com/sites/ourteammlm/settings/env
2. Add these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://utvasathtyasoxelnxuf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[Get from Supabase dashboard]
   ```

To get the Anon Key:
1. Go to https://app.supabase.com/project/utvasathtyasoxelnxuf/settings/api
2. Copy the "anon public" key
3. Paste it in Netlify

## Step 2: Trigger a New Deployment

After adding the environment variables:
1. Go to https://app.netlify.com/sites/ourteammlm/deploys
2. Click "Trigger deploy" → "Deploy site"

## Step 3: Verify the Deployment

Once deployed (takes 2-5 minutes), check:
1. Environment variables: https://ourteam.gr/api/env-check
2. API connectivity: https://ourteam.gr/api/test

## Step 4: Test Signup

If the environment check shows variables are set, try signing up again.

## What We Fixed

### Database Changes:
- Added RLS policy for INSERT operations on members table
- Added policy for username availability checking

### Code Changes:
- Fixed signup route to use correct database schema (name field instead of first_name/last_name)
- Fixed TypeScript errors in test routes
- Removed invalid admin API calls

## If It Still Doesn't Work

Check the browser console for the exact error and let me know. The most common issues are:
1. Missing environment variables (check Step 1)
2. Database connection issues
3. RLS policy conflicts

## Quick Reference

- Supabase Project: https://app.supabase.com/project/utvasathtyasoxelnxuf
- Netlify Site: https://app.netlify.com/sites/ourteammlm
- Live Site: https://ourteam.gr
