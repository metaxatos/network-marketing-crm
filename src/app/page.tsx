'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [envStatus, setEnvStatus] = useState<'loading' | 'configured' | 'missing'>('loading')

  useEffect(() => {
    // Check if environment variables are configured
    const checkEnv = async () => {
      try {
        const response = await fetch('/api/check-env')
        const data = await response.json()
        
        if (data.supabaseUrl.exists && data.supabaseAnonKey.exists) {
          setEnvStatus('configured')
        } else {
          setEnvStatus('missing')
        }
      } catch (error) {
        setEnvStatus('missing')
      }
    }
    
    checkEnv()
  }, [])

  if (envStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-celebration-50">
        <div className="animate-pulse">
          <div className="text-4xl mb-4">🌟</div>
          <p className="text-warm-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (envStatus === 'missing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-red-800 mb-2">
                Configuration Required
              </h1>
              <p className="text-red-600">
                Environment variables are not configured for this deployment.
              </p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-3">
                Quick Setup Instructions:
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-red-700">
                <li>Go to your <a href="https://app.netlify.com" className="underline font-medium" target="_blank" rel="noopener noreferrer">Netlify Dashboard</a></li>
                <li>Select your site "ourteammlm"</li>
                <li>Navigate to Site configuration → Environment variables</li>
                <li>Add the required environment variables (see documentation)</li>
                <li>Trigger a new deploy</li>
              </ol>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Link 
                href="/debug-auth" 
                className="btn-secondary"
              >
                Check Configuration
              </Link>
              <a 
                href="https://github.com/metaxatos/network-marketing-crm/blob/main/NETLIFY_ENV_SETUP.md" 
                className="btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Setup Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-celebration-50">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12 animate-fade-in">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-5xl font-bold text-warm-800 mb-4">
            Welcome to Network Marketing CRM
          </h1>
          <p className="text-xl text-warm-600 mb-8">
            Empower your network, grow your business
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="card hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-warm-800 mb-3">
                Manage Your Network
              </h2>
              <p className="text-warm-600 mb-4">
                Keep track of your contacts, team members, and grow your organization efficiently.
              </p>
              <Link href="/auth/signup" className="text-primary-600 font-medium hover:text-primary-700">
                Get Started →
              </Link>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-warm-800 mb-3">
                Track Your Success
              </h2>
              <p className="text-warm-600 mb-4">
                Monitor your progress with powerful analytics and insights to optimize your strategy.
              </p>
              <Link href="/auth/login" className="text-primary-600 font-medium hover:text-primary-700">
                Sign In →
              </Link>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-warm-800 mb-6">
              Ready to Transform Your Business?
            </h3>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
                🚀 Start Free Trial
              </Link>
              <Link href="/auth/login" className="btn-secondary text-lg px-8 py-3">
                🔑 Sign In
              </Link>
            </div>
          </div>

          <div className="mt-16 text-center text-sm text-warm-500">
            <p>Trusted by thousands of network marketers worldwide</p>
            <div className="flex justify-center gap-8 mt-4">
              <span>🔒 Secure</span>
              <span>☁️ Cloud-based</span>
              <span>📱 Mobile-friendly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
