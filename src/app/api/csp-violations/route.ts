import { NextRequest, NextResponse } from 'next/server'

interface CSPViolation {
  'document-uri': string
  referrer: string
  'violated-directive': string
  'effective-directive': string
  'original-policy': string
  disposition: string
  'blocked-uri': string
  'line-number'?: number
  'column-number'?: number
  'source-file'?: string
  'status-code': number
  'script-sample'?: string
}

interface CSPReport {
  'csp-report': CSPViolation
}

// POST /api/csp-violations - Receive CSP violation reports
export async function POST(req: NextRequest) {
  try {
    const report: CSPReport = await req.json()
    const violation = report['csp-report']
    
    // Skip noise - these are common false positives
    const ignoredSources = [
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'ms-browser-extension://',
      'about:blank',
      'data:',
      'eval', // Expected from video players
    ]
    
    const blockedUri = violation['blocked-uri'] || ''
    const shouldIgnore = ignoredSources.some(source => blockedUri.startsWith(source))
    
    if (shouldIgnore) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }
    
    // Log significant violations for review
    const logData = {
      timestamp: new Date().toISOString(),
      documentUri: violation['document-uri'],
      violatedDirective: violation['violated-directive'],
      blockedUri: violation['blocked-uri'],
      sourceFile: violation['source-file'],
      lineNumber: violation['line-number'],
      columnNumber: violation['column-number'],
      scriptSample: violation['script-sample']?.substring(0, 100), // Truncate
      userAgent: req.headers.get('user-agent'),
      referrer: req.headers.get('referer'),
    }
    
    // Log to console (Netlify/Vercel will capture this)
    console.warn('CSP Violation Report:', JSON.stringify(logData, null, 2))
    
    // In production, you might want to send this to an external logging service
    // like Sentry, LogRocket, or Datadog
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external service
      // await fetch('YOUR_LOGGING_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logData)
      // })
    }
    
    return NextResponse.json({ status: 'logged' }, { status: 200 })
  } catch (error) {
    console.error('CSP violation report processing error:', error)
    return NextResponse.json({ error: 'Invalid report format' }, { status: 400 })
  }
}

// GET /api/csp-violations - Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'CSP violation reporting endpoint is active',
    timestamp: new Date().toISOString(),
    instructions: [
      'Set CSP_REPORT_ONLY=true to enable 24h monitoring',
      'Check server logs for violation reports',
      'Review blocked URIs for missing CSP domains',
      'Turn off report-only mode after monitoring period'
    ]
  })
} 