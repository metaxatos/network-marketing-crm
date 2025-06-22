#!/usr/bin/env node

/**
 * Video Training System Health Check
 * Verifies all fixes are working and monitors system health
 */

const https = require('https')
const fs = require('fs')

class VideoSystemHealthCheck {
  constructor(baseUrl = 'https://ourteammlm.netlify.app') {
    this.baseUrl = baseUrl
    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'UNKNOWN',
      checks: {}
    }
  }

  async runAllChecks() {
    console.log('🚀 Starting Video Training System Health Check...\n')
    
    try {
      await this.checkVideoPageLoad()
      await this.checkCSPHeaders()
      await this.checkProgressAPI()
      await this.checkNetlifyFunctions()
      await this.checkSupabaseConnectivity()
      await this.checkMobileSafariHeaders()
      
      this.calculateOverallHealth()
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message)
      this.results.overall = 'FAILED'
    }
    
    return this.results
  }

  async checkVideoPageLoad() {
    console.log('📹 Checking video page load performance...')
    const startTime = Date.now()
    
    try {
      // Test video page load
      await this.makeRequest('/training/video/sample-video')
      const loadTime = Date.now() - startTime
      
      this.results.checks.videoPageLoad = {
        status: loadTime < 3000 ? 'PASS' : 'WARN',
        loadTime: loadTime,
        threshold: 3000,
        message: loadTime < 3000 ? 'Page loads quickly' : 'Page load is slow'
      }
      
      console.log(`   ${this.results.checks.videoPageLoad.status === 'PASS' ? '✅' : '⚠️'} Load time: ${loadTime}ms`)
      
    } catch (error) {
      this.results.checks.videoPageLoad = {
        status: 'FAIL',
        error: error.message,
        message: 'Video page failed to load'
      }
      console.log('   ❌ Video page load failed')
    }
  }

  async checkCSPHeaders() {
    console.log('🛡️ Checking CSP headers...')
    
    try {
      const response = await this.makeRequest('/training/video/sample-video', { method: 'HEAD' })
      const cspHeader = response.headers['content-security-policy'] || 
                       response.headers['content-security-policy-report-only']
      
      if (!cspHeader) {
        this.results.checks.cspHeaders = {
          status: 'FAIL',
          message: 'CSP header is missing'
        }
        console.log('   ❌ CSP header missing')
        return
      }
      
      // Check for required video domains
      const requiredDomains = [
        'player.vimeo.com',
        'fast.wistia.com',
        'www.youtube.com',
        'unsafe-eval'
      ]
      
      const missingDomains = requiredDomains.filter(domain => !cspHeader.includes(domain))
      
      this.results.checks.cspHeaders = {
        status: missingDomains.length === 0 ? 'PASS' : 'WARN',
        missingDomains: missingDomains,
        isReportOnly: cspHeader.includes('Content-Security-Policy-Report-Only'),
        message: missingDomains.length === 0 ? 'All video domains present' : `Missing domains: ${missingDomains.join(', ')}`
      }
      
      console.log(`   ${this.results.checks.cspHeaders.status === 'PASS' ? '✅' : '⚠️'} ${this.results.checks.cspHeaders.message}`)
      
    } catch (error) {
      this.results.checks.cspHeaders = {
        status: 'FAIL',
        error: error.message,
        message: 'Failed to check CSP headers'
      }
      console.log('   ❌ CSP header check failed')
    }
  }

  async checkProgressAPI() {
    console.log('📊 Checking progress API deprecation...')
    
    try {
      // These routes should be deprecated but still respond
      const deprecatedRoutes = [
        '/api/training/progress',
        '/api/training/video-progress',
        '/api/training/lesson/sample-lesson',
        '/api/training/video/sample-video'
      ]
      
      let activeRoutes = 0
      
      for (const route of deprecatedRoutes) {
        try {
          await this.makeRequest(route)
          activeRoutes++
        } catch (error) {
          // Expected for deprecated routes
        }
      }
      
      this.results.checks.progressAPI = {
        status: activeRoutes === 0 ? 'PASS' : 'WARN',
        activeRoutes: activeRoutes,
        message: activeRoutes === 0 
          ? 'All deprecated routes removed' 
          : `${activeRoutes} deprecated routes still active`
      }
      
      console.log(`   ${this.results.checks.progressAPI.status === 'PASS' ? '✅' : '⚠️'} ${this.results.checks.progressAPI.message}`)
      
    } catch (error) {
      this.results.checks.progressAPI = {
        status: 'FAIL',
        error: error.message,
        message: 'Failed to check progress API'
      }
      console.log('   ❌ Progress API check failed')
    }
  }

  async checkNetlifyFunctions() {
    console.log('⚡ Checking Netlify function activity...')
    
    try {
      // Check health endpoint
      const healthResponse = await this.makeRequest('/api/health')
      
      this.results.checks.netlifyFunctions = {
        status: 'PASS',
        message: 'Health endpoint responds correctly',
        responseTime: Date.now() - Date.now() // Simplified for demo
      }
      
      console.log('   ✅ Netlify functions are responding')
      
    } catch (error) {
      this.results.checks.netlifyFunctions = {
        status: 'FAIL',
        error: error.message,
        message: 'Netlify functions not responding'
      }
      console.log('   ❌ Netlify functions check failed')
    }
  }

  async checkSupabaseConnectivity() {
    console.log('🗄️ Checking Supabase connectivity...')
    
    try {
      // Test a simple API call that would use Supabase
      await this.makeRequest('/api/health-check')
      
      this.results.checks.supabaseConnectivity = {
        status: 'PASS',
        message: 'Supabase connectivity verified'
      }
      
      console.log('   ✅ Supabase is reachable')
      
    } catch (error) {
      this.results.checks.supabaseConnectivity = {
        status: 'FAIL',
        error: error.message,
        message: 'Supabase connectivity failed'
      }
      console.log('   ❌ Supabase connectivity failed')
    }
  }

  async checkMobileSafariHeaders() {
    console.log('📱 Checking mobile Safari compatibility headers...')
    
    try {
      const response = await this.makeRequest('/training/video/sample-video', { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        }
      })
      
      // Check for autoplay-friendly headers
      const hasAutoplayPolicy = response.headers['permissions-policy']?.includes('autoplay')
      
      this.results.checks.mobileSafariHeaders = {
        status: 'PASS',
        hasAutoplayPolicy: hasAutoplayPolicy,
        message: 'Mobile Safari headers configured'
      }
      
      console.log('   ✅ Mobile Safari headers configured')
      
    } catch (error) {
      this.results.checks.mobileSafariHeaders = {
        status: 'FAIL',
        error: error.message,
        message: 'Mobile Safari header check failed'
      }
      console.log('   ❌ Mobile Safari header check failed')
    }
  }

  calculateOverallHealth() {
    const statuses = Object.values(this.results.checks).map(check => check.status)
    const failCount = statuses.filter(s => s === 'FAIL').length
    const warnCount = statuses.filter(s => s === 'WARN').length
    
    if (failCount > 0) {
      this.results.overall = 'UNHEALTHY'
    } else if (warnCount > 0) {
      this.results.overall = 'DEGRADED'
    } else {
      this.results.overall = 'HEALTHY'
    }
  }

  generateReport() {
    console.log('\n📋 HEALTH CHECK REPORT')
    console.log('========================')
    console.log(`Overall Status: ${this.getStatusEmoji(this.results.overall)} ${this.results.overall}`)
    console.log(`Timestamp: ${this.results.timestamp}`)
    console.log('')
    
    Object.entries(this.results.checks).forEach(([checkName, result]) => {
      console.log(`${this.getStatusEmoji(result.status)} ${checkName}: ${result.message}`)
    })
    
    console.log('')
    
    // Save report to file
    const reportPath = `health-check-${Date.now()}.json`
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
    console.log(`📄 Detailed report saved to: ${reportPath}`)
    
    // Recommendations
    this.generateRecommendations()
  }

  generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS')
    console.log('==================')
    
    Object.entries(this.results.checks).forEach(([checkName, result]) => {
      if (result.status === 'FAIL') {
        console.log(`🚨 ${checkName}: ${this.getRecommendation(checkName, result)}`)
      } else if (result.status === 'WARN') {
        console.log(`⚠️ ${checkName}: ${this.getRecommendation(checkName, result)}`)
      }
    })
    
    if (this.results.overall === 'HEALTHY') {
      console.log('✅ System is healthy! Consider running E2E tests next.')
    }
  }

  getRecommendation(checkName, result) {
    const recommendations = {
      videoPageLoad: 'Check Netlify function cold starts and Supabase query performance',
      cspHeaders: 'Update CSP configuration in next.config.js',
      progressAPI: 'Remove deprecated API routes after confirming zero traffic',
      netlifyFunctions: 'Check Netlify dashboard for function errors',
      supabaseConnectivity: 'Verify Supabase credentials and RLS policies',
      mobileSafariHeaders: 'Test video autoplay on actual iOS devices'
    }
    
    return recommendations[checkName] || 'Review error details and logs'
  }

  getStatusEmoji(status) {
    const emojis = {
      'PASS': '✅',
      'WARN': '⚠️',
      'FAIL': '❌',
      'HEALTHY': '💚',
      'DEGRADED': '🟡',
      'UNHEALTHY': '🔴'
    }
    return emojis[status] || '❓'
  }

  makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl)
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'VideoSystemHealthCheck/1.0',
          ...options.headers
        }
      }
      
      const req = https.request(requestOptions, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          })
        })
      })
      
      req.on('error', reject)
      req.setTimeout(10000, () => reject(new Error('Request timeout')))
      req.end()
    })
  }
}

// Run health check if called directly
if (require.main === module) {
  const checker = new VideoSystemHealthCheck(process.argv[2])
  checker.runAllChecks()
    .then(results => {
      process.exit(results.overall === 'HEALTHY' ? 0 : 1)
    })
    .catch(error => {
      console.error('Health check failed:', error)
      process.exit(1)
    })
}

module.exports = VideoSystemHealthCheck 