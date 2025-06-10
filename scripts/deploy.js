#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting deployment process...')

// Check if netlify.toml exists
const netlifyConfigPath = path.join(process.cwd(), 'netlify.toml')
if (!fs.existsSync(netlifyConfigPath)) {
  console.error('❌ netlify.toml not found!')
  process.exit(1)
}

console.log('✅ netlify.toml found')

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.warn('⚠️  Missing environment variables (make sure they are set in Netlify):')
  missingVars.forEach(varName => console.warn(`   - ${varName}`))
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...')
  execSync('npm install', { stdio: 'inherit' })
  
  // Run type check
  console.log('🔍 Running type check...')
  execSync('npm run type-check', { stdio: 'inherit' })
  
  // Build the project
  console.log('🏗️  Building project...')
  execSync('npm run build', { stdio: 'inherit' })
  
  console.log('✅ Build completed successfully!')
  console.log('📋 Deployment checklist:')
  console.log('   1. Push changes to your Git repository')
  console.log('   2. Netlify will automatically deploy from your connected branch')
  console.log('   3. Check environment variables in Netlify dashboard')
  console.log('   4. Test API endpoints after deployment')
  
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
} 