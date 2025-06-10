import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check database connection
    const supabase = await createClient()
    const { error: dbError } = await supabase.from('members').select('count').limit(1)
    
    if (dbError) {
      throw new Error(`Database check failed: ${dbError.message}`)
    }

    // Check environment variables
    const requiredEnvs = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const missingEnvs = requiredEnvs.filter(env => !process.env[env])
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      services: {
        supabase: 'operational',
        resend: process.env.RESEND_API_KEY ? 'configured' : 'not-configured'
      },
      warnings: missingEnvs.length > 0 ? [`Missing env vars: ${missingEnvs.join(', ')}`] : []
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json(errorData, { status: 503 })
  }
}

export const runtime = 'edge' 