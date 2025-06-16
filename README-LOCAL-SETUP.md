# Local Development Setup

## Issue: Contacts Page Not Loading

The contacts page is showing a "Failed to Load Data" error because the environment variables are not configured for local development.

## Solution

Create a `.env.local` file in the project root with the following content:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://utvasathtyasoxelnxuf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmFzYXRodHlhc294ZWxueHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjE3NDEsImV4cCI6MjA2NDg5Nzc0MX0.MrpNzlPGVJPIXq7R_wiHoomYtjLActFmbKVgSJLlq8E

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Network Marketing CRM
```

## Steps

1. **Create the environment file:**
   ```bash
   # In the project root directory
   touch .env.local
   ```

2. **Add the content above to `.env.local`**

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

4. **Verify the setup:**
   Visit http://localhost:3000/api/check-env to confirm all environment variables are configured.

## Troubleshooting

- Make sure the `.env.local` file is in the project root (same level as `package.json`)
- Restart your development server after creating the file
- Check the browser console for any remaining authentication errors
- The file should not be committed to git (it's already in `.gitignore`)

## Production Setup

This project is configured to deploy on Netlify. The environment variables are already set up in the Netlify dashboard. This setup is only needed for local development. 