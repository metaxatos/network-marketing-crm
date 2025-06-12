# Deployment Guide for Netlify

## Problem Solved
The API routes were returning 404 errors because the Netlify configuration wasn't properly set up for Next.js 15 with App Router.

## Changes Made

### 1. Updated `netlify.toml`
- Fixed API route handling to use `/.netlify/functions/___netlify-handler`
- Added proper Next.js plugin configuration
- Optimized static file serving
- Added security headers

### 2. Updated `next.config.js`
- Added Netlify-specific output configuration
- Updated allowed origins for server actions
- Added Netlify domain support


### 3. Added Dependencies
- Added `@netlify/plugin-nextjs` to handle Next.js deployment

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Check Build Locally
```bash
npm run deploy:check
```

### 3. Environment Variables in Netlify
Make sure these are set in your Netlify dashboard under Site Settings > Environment Variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)

**Optional:**
- `RESEND_API_KEY` - For email functionality
- `DISABLE_CSP` - Set to "true" if you have CSP issues

### 4. Deploy
1. Commit and push your changes to your Git repository
2. Netlify will automatically trigger a new build
3. Wait for deployment to complete

### 5. Test After Deployment
Test these endpoints to verify everything is working:

- Health Check: `https://yoursite.netlify.app/api/health`
- Email Analytics: `https://yoursite.netlify.app/api/emails/analytics?days=7`

## Troubleshooting

### If API routes still return 404:
1. Check the Netlify build logs for errors
2. Verify environment variables are set correctly
3. Ensure the `@netlify/plugin-nextjs` plugin is installed
4. Check that the build completed successfully

### If build fails:
1. Run `npm run build` locally to check for errors
2. Fix any TypeScript or ESLint errors
3. Ensure all dependencies are installed

### Common Issues:
- **Missing environment variables**: Set them in Netlify dashboard
- **Plugin not found**: Make sure `@netlify/plugin-nextjs` is in package.json
- **Function timeout**: Check your API routes for slow database queries

## Monitoring
After deployment, monitor:
- Netlify build logs
- Function logs in Netlify dashboard
- Browser console for any client-side errors

## Performance Tips
- Use Supabase edge functions for heavy computations
- Implement proper caching headers
- Optimize database queries with proper indexes
- Use Netlify Analytics to monitor performance 

[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs" 