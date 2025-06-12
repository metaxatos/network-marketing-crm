# Deploy Trigger
Last updated: 2025-06-12 09:41:00 UTC

This file is used to trigger Netlify deployments when needed.

## Recent Changes:
- Fixed diagnostics page by removing Card component imports
- Build configuration updates:
  - Added .npmrc to skip optional dependencies  
  - Updated netlify.toml with Node.js 20
  - Set NPM_CONFIG_OMIT=optional
- Authentication fixes included:
  - Simplified RLS policies
  - New API endpoint with better error handling
  - Performance optimizations
