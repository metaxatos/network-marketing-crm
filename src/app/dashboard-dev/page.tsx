'use client'

import { useState, useEffect } from 'react'

export default function DashboardDevPage() {
  const [greeting, setGreeting] = useState('Hello')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 pb-24">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="flex justify-between items-start mb-4">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-warm-800 mb-2">
              {greeting}, Champion! 🌟
            </h1>
            <p className="text-warm-600">
              Ready to make today amazing? Let's grow together!
            </p>
            <p className="text-sm text-blue-600 mt-1">
              🔧 Development Mode - No Auth Required
            </p>
          </div>
          <button className="btn-secondary text-sm px-3 py-2">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="px-6 mb-8">
        <h2 className="text-xl font-semibold text-warm-700 mb-4">
          Quick Actions 🚀
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          <a href="/contacts" className="btn-primary text-left p-6 h-auto block">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <div className="font-semibold text-lg">Manage Contacts</div>
                <div className="text-primary-100 text-sm">View & add contacts</div>
              </div>
            </div>
          </a>
          
          <a href="/emails" className="btn-success text-left p-6 h-auto block">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📧</div>
              <div>
                <div className="font-semibold text-lg">Send Email</div>
                <div className="text-success-100 text-sm">Stay in touch</div>
              </div>
            </div>
          </a>
          
          <a href="/team" className="btn-celebration text-left p-6 h-auto block">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🌳</div>
              <div>
                <div className="font-semibold text-lg">View My Team</div>
                <div className="text-celebration-100 text-sm">Manage your organization</div>
              </div>
            </div>
          </a>
          
          <a href="/events" className="btn-primary text-left p-6 h-auto block">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📅</div>
              <div>
                <div className="font-semibold text-lg">Host Events</div>
                <div className="text-primary-100 text-sm">Create meetings & presentations</div>
              </div>
            </div>
          </a>
          
          <a href="/training" className="btn-success text-left p-6 h-auto block">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎓</div>
              <div>
                <div className="font-semibold text-lg">Continue Learning</div>
                <div className="text-success-100 text-sm">Level up your skills</div>
              </div>
            </div>
          </a>
          
          <a href="/landing-page" className="btn-secondary text-left p-6 h-auto block">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🌐</div>
              <div>
                <div className="font-semibold text-lg">Landing Page</div>
                <div className="text-gray-600 text-sm">Manage your public page</div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Metrics */}
      <section className="px-6 mb-8">
        <h2 className="text-xl font-semibold text-warm-700 mb-4">
          Your Progress 📈
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              7
            </div>
            <div className="text-sm text-warm-600">
              Contacts This Week
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-success-600 mb-1">
              3
            </div>
            <div className="text-sm text-warm-600">
              Emails Today
            </div>
          </div>
        </div>
        
        <div className="card mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-warm-700">
              Training Progress
            </span>
            <span className="text-sm text-warm-600">
              65%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: '65%' }}
            />
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-item active">
          <div className="text-2xl mb-1">🏠</div>
          <span className="text-xs font-medium">Home</span>
        </div>
        
        <a href="/contacts" className="nav-item">
          <div className="text-2xl mb-1">👥</div>
          <span className="text-xs font-medium">Contacts</span>
        </a>
        
        <a href="/team" className="nav-item">
          <div className="text-2xl mb-1">🌳</div>
          <span className="text-xs font-medium">Team</span>
        </a>
        
        <a href="/events" className="nav-item">
          <div className="text-2xl mb-1">📅</div>
          <span className="text-xs font-medium">Events</span>
        </a>
        
        <a href="/emails" className="nav-item">
          <div className="text-2xl mb-1">📧</div>
          <span className="text-xs font-medium">Email</span>
        </a>
      </nav>
    </div>
  )
} 