const checks = [
  { name: 'Homepage loads', url: '/' },
  { name: 'Login page accessible', url: '/auth/login' },
  { name: 'Dashboard accessible', url: '/dashboard' },
  { name: 'API health check', url: '/api/health' },
]

async function verifyProduction() {
  const baseUrl = process.env.PRODUCTION_URL || process.env.NEXT_PUBLIC_APP_URL
  
  if (!baseUrl) {
    console.error('❌ No PRODUCTION_URL or NEXT_PUBLIC_APP_URL provided')
    process.exit(1)
  }

  console.log(`🔍 Verifying production at: ${baseUrl}\n`)
  
  let allPassed = true

  for (const check of checks) {
    try {
      console.log(`Checking: ${check.name}...`)
      const response = await fetch(baseUrl + check.url)
      
      if (response.ok) {
        console.log(`✅ ${check.name}: OK (${response.status})`)
      } else {
        console.log(`❌ ${check.name}: Failed (${response.status})`)
        allPassed = false
      }
    } catch (error) {
      console.log(`❌ ${check.name}: Failed (${error.message})`)
      allPassed = false
    }
  }

  console.log('\n' + '='.repeat(50))
  
  if (allPassed) {
    console.log('🎉 All production checks passed!')
    console.log(`🚀 Your Network Marketing CRM is live at: ${baseUrl}`)
  } else {
    console.log('⚠️  Some checks failed. Please review the deployment.')
    process.exit(1)
  }
}

verifyProduction().catch(error => {
  console.error('Verification script failed:', error)
  process.exit(1)
}) 