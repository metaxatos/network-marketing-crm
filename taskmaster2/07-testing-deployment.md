Task 7: GitHub Setup & Netlify Deployment
Priority: 🔴 HIGH
Estimated Time: 2-3 days
Status: 📋 TODO
Description
Prepare the Network Marketing CRM for production by setting up GitHub repository, implementing essential testing, and deploying to Netlify. Focus on getting a working production version live while ensuring basic reliability and security.
Context

App is complete and working locally
Need to move from local development to production
Using Netlify for hosting (free tier friendly)
Must handle environment variables securely
Focus on getting live first, optimize later

Acceptance Criteria
GitHub Repository Setup

 Initialize Git repository with proper .gitignore
 Create GitHub repository
 Initial commit with clean code structure
 README.md with project documentation
 Branch protection for main branch

Netlify Deployment

 Netlify account and project setup
 Build configuration for Next.js
 Environment variables configured
 Custom domain setup (if available)
 Automatic deployments from GitHub

Essential Testing

 Critical user flows work in production
 Authentication flow testing
 Database connections verified
 Email sending functionality confirmed
 Mobile responsiveness check

Production Readiness

 Error handling for common failures
 Loading states for all async operations
 Secure environment variable management
 Basic performance optimization
 Production database setup

Implementation Steps
1. GitHub Repository Setup
Initialize Git Repository
bash# Initialize git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/
dist/

# Production
*.production

# Misc
.DS_Store
*.pem
.vscode/
.idea/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# Typescript
*.tsbuildinfo
next-env.d.ts

# PWA
public/sw.js
public/workbox-*.js
public/worker-*.js
public/sw.js.map
public/workbox-*.js.map
public/worker-*.js.map

# Supabase
supabase/.temp/
supabase/.env
EOF

# Initial commit
git add .
git commit -m "Initial commit: Network Marketing CRM"
Create README.md
markdown# Network Marketing CRM

A modern CRM system designed specifically for network marketing professionals, built with Next.js and Supabase.

## Features

- 👥 Contact Management
- 📧 Email Templates & Tracking
- 📚 Training Progress Tracking
- 🎯 Landing Page Builder
- 🏢 Multi-Company Support
- 📱 Mobile Responsive

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Netlify
- **Email**: Resend API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Resend API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/network-marketing-crm.git
cd network-marketing-crm

Install dependencies

bashnpm install

Set up environment variables

bashcp .env.example .env.local
# Edit .env.local with your values

Run development server

bashnpm run dev
Environment Variables
Create a .env.local file with:
envNEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
Deployment
This app is configured for deployment on Netlify.

Fork this repository
Connect to Netlify
Configure environment variables
Deploy

License
MIT

### 2. Prepare for Netlify Deployment

#### Create netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PRIVATE_TARGET = "server"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[context.production.environment]
  NEXT_SERVERLESS = "true"
Create .env.example
env# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME="Network Marketing CRM"

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
Update package.json scripts
json{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test",
    "analyze": "ANALYZE=true next build"
  }
}
3. Production Code Adjustments
Update API Routes for Netlify Functions
typescript// Convert API routes to work with Netlify
// Example: /src/app/api/contacts/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Your existing logic
    return NextResponse.json({ success: true, data: contacts })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add runtime config
export const runtime = 'edge' // or 'nodejs'
Add Error Boundaries
typescript// src/app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
Add Loading States
typescript// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
}
4. Essential Testing
Basic E2E Test Setup
typescript// tests/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can log in', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })
})
Production Checklist Script
typescript// scripts/production-check.ts
async function checkProduction() {
  console.log('🔍 Running production checks...\n')
  
  // Check environment variables
  const requiredEnvs = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY'
  ]
  
  const missingEnvs = requiredEnvs.filter(env => !process.env[env])
  
  if (missingEnvs.length > 0) {
    console.error('❌ Missing environment variables:', missingEnvs)
    process.exit(1)
  }
  
  console.log('✅ Environment variables configured')
  
  // Test database connection
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase.from('members').select('count')
    if (error) throw error
    
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
  
  console.log('\n🎉 Production checks passed!')
}

checkProduction()
5. Deployment Process
GitHub Setup
bash# Create GitHub repository
# Go to https://github.com/new

# Add remote origin
git remote add origin https://github.com/yourusername/network-marketing-crm.git

# Push to GitHub
git branch -M main
git push -u origin main
Netlify Setup Steps

Create Netlify Account

Go to https://app.netlify.com
Sign up with GitHub


Import Project

Click "Add new site" → "Import an existing project"
Choose GitHub
Select your repository


Configure Build Settings
Build command: npm run build
Publish directory: .next

Set Environment Variables

Go to Site settings → Environment variables
Add all variables from .env.example
Use production values


Deploy

Click "Deploy site"
Wait for build to complete



6. Post-Deployment Tasks
Verify Production
typescript// scripts/verify-production.js
const checks = [
  { name: 'Homepage loads', url: '/' },
  { name: 'Login page accessible', url: '/auth/login' },
  { name: 'API health check', url: '/api/health' },
]

async function verifyProduction() {
  const baseUrl = process.env.PRODUCTION_URL || 'https://your-app.netlify.app'
  
  for (const check of checks) {
    try {
      const response = await fetch(baseUrl + check.url)
      console.log(`${check.name}: ${response.ok ? '✅' : '❌'} (${response.status})`)
    } catch (error) {
      console.log(`${check.name}: ❌ Failed`)
    }
  }
}

verifyProduction()
Setup Monitoring
typescript// src/lib/monitoring.ts
export function logError(error: Error, context?: any) {
  if (process.env.NODE_ENV === 'production') {
    // Log to console in production
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    })
    
    // TODO: Add external error tracking (Sentry, LogRocket, etc.)
  }
}
Success Criteria
Repository & Documentation

 Clean Git history with meaningful commits
 Comprehensive README with setup instructions
 Environment variables documented
 License file added

Deployment

 Site live on Netlify
 Custom domain configured (optional)
 SSL certificate active
 Build succeeds without warnings

Functionality

 Users can register and login
 Contact management works
 Email sending functions
 All pages load without errors
 Mobile responsive design verified

Security & Performance

 Environment variables secure
 No sensitive data in Git
 Page load time < 3 seconds
 No console errors in production

Common Issues & Solutions
Build Failures
bash# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
Environment Variable Issues

Double-check variable names (exact match)
Ensure no quotes in Netlify env vars
Rebuild after changing env vars

Database Connection

Verify Supabase project is not paused
Check connection pooling settings
Ensure RLS policies allow access

Next Steps After Deployment

Set up custom domain (if available)
Enable Netlify Analytics (optional)
Configure automatic backups for database
Set up uptime monitoring (UptimeRobot, etc.)
Create staging environment for testing