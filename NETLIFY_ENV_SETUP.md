# Environment Variables Setup for Netlify

To fix the authentication issue, you need to add these environment variables to your Netlify deployment:

## Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://utvasathtyasoxelnxuf.supabase.co
   ```

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmFzYXRodHlhc294ZWxueHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjE3NDEsImV4cCI6MjA2NDg5Nzc0MX0.MrpNzlPGVJPIXq7R_wiHoomYtjLActFmbKVgSJLlq8E
   ```

3. **NEXT_PUBLIC_APP_URL**
   ```
   https://ourteammlm.netlify.app
   ```

4. **NEXT_PUBLIC_APP_NAME**
   ```
   Network Marketing CRM
   ```

5. **SUPABASE_SERVICE_ROLE_KEY** (You'll need to get this from your Supabase dashboard)

## How to Add These to Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site "ourteammlm"
3. Go to "Site configuration" → "Environment variables"
4. Click "Add a variable"
5. Add each of the variables above with their values
6. After adding all variables, trigger a new deploy:
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

## Getting the Service Role Key

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project "OurTeam 2.0"
3. Go to "Settings" → "API"
4. Copy the "service_role" key (keep this secret!)
5. Add it as SUPABASE_SERVICE_ROLE_KEY in Netlify

## Testing the Fix

After deployment, you can verify the environment variables are set by visiting:
https://ourteammlm.netlify.app/api/check-env

This endpoint will show if the variables are properly configured.
