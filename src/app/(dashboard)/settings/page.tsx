'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

export default function SettingsPage() {
  const { member, updateMember, checkUsernameAvailability } = useUserStore()
  
  const [memberData, setMemberData] = useState({
    email: '',
    phone: '',
    username: '',
    first_name: '',
    last_name: '',
    timezone: 'UTC',
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (member) {
      setMemberData({
        email: member.email || '',
        phone: member.phone || '',
        username: member.username || '',
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        timezone: member.timezone || 'UTC',
      })
    }
  }, [member])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-z0-9_-]+$/
    return usernameRegex.test(username) && username.length >= 3 && username.length <= 30
  }

  const checkUsername = async (username: string) => {
    if (!validateUsername(username) || username === member?.username) {
      setUsernameAvailable(username === member?.username ? true : false)
      return
    }

    setUsernameChecking(true)
    try {
      const available = await checkUsernameAvailability(username)
      setUsernameAvailable(available)
    } catch (error) {
      setUsernameAvailable(false)
    } finally {
      setUsernameChecking(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setMemberData(prev => ({ ...prev, username: cleaned }))
    
    if (cleaned.length >= 3) {
      checkUsername(cleaned)
    } else {
      setUsernameAvailable(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setSuccess('')

    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!memberData.email || !validateEmail(memberData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!memberData.phone || !validatePhone(memberData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (!memberData.username || !validateUsername(memberData.username)) {
      newErrors.username = 'Username must be 3-30 characters, lowercase letters, numbers, hyphens, and underscores only'
    } else if (usernameAvailable === false) {
      newErrors.username = 'This username is already taken'
    }

    if (!memberData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!memberData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      // Update member data (now includes all profile info)
      await updateMember(memberData)
      
      setSuccess('Settings updated successfully! 🎉')
    } catch (error) {
      console.error('Settings update error:', error)
      setErrors({ general: 'Failed to update settings. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 pb-24">
      {/* Header */}
      <header className="px-6 py-8">
        <h1 className="text-3xl font-bold text-warm-800 mb-2">
          Settings ⚙️
        </h1>
        <p className="text-warm-600">
          Manage your profile and account information
        </p>
      </header>

      {/* Settings Form */}
      <div className="px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
              {errors.general}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-center">
              {success}
            </div>
          )}

          {/* Profile Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-warm-800 mb-4">
              Profile Information
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-warm-700 mb-2">
                  First Name
                </label>
                <input
                  id="first_name"
                  type="text"
                  value={memberData.first_name}
                  onChange={(e) => setMemberData(prev => ({ ...prev, first_name: e.target.value }))}
                  className={`input ${errors.first_name ? 'border-red-500' : ''}`}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-warm-700 mb-2">
                  Last Name
                </label>
                <input
                  id="last_name"
                  type="text"
                  value={memberData.last_name}
                  onChange={(e) => setMemberData(prev => ({ ...prev, last_name: e.target.value }))}
                  className={`input ${errors.last_name ? 'border-red-500' : ''}`}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="timezone" className="block text-sm font-medium text-warm-700 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                value={memberData.timezone}
                onChange={(e) => setMemberData(prev => ({ ...prev, timezone: e.target.value }))}
                className="input"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>
          </div>

          {/* Account Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-warm-800 mb-4">
              Account Information
            </h2>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-warm-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={memberData.email}
                onChange={(e) => setMemberData(prev => ({ ...prev, email: e.target.value }))}
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-warm-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={memberData.phone}
                onChange={(e) => setMemberData(prev => ({ ...prev, phone: e.target.value }))}
                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-warm-700 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={memberData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`input ${errors.username ? 'border-red-500' : ''}`}
                  placeholder="johndoe123"
                />
                {usernameChecking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 bg-warm-300 rounded-sm animate-shimmer"></div>
                  </div>
                )}
              </div>
              {memberData.username && memberData.username.length >= 3 && (
                <p className={`text-sm mt-1 ${
                  usernameAvailable === true 
                    ? 'text-green-600' 
                    : usernameAvailable === false 
                    ? 'text-red-500' 
                    : 'text-warm-500'
                }`}>
                  {usernameAvailable === true 
                    ? '✓ Username is available' 
                    : usernameAvailable === false 
                    ? '✗ Username is taken' 
                    : 'Checking...'}
                </p>
              )}
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
              )}
              <p className="text-xs text-warm-500 mt-1">
                3-30 characters, lowercase letters, numbers, hyphens, and underscores only
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || usernameAvailable === false}
            className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 bg-white/30 rounded-sm mr-2 animate-shimmer"></div>
                Updating...
              </div>
            ) : (
              '💾 Save Settings'
            )}
          </button>
        </form>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <a href="/dashboard" className="nav-item">
          <div className="text-2xl mb-1">🏠</div>
          <span className="text-xs font-medium">Home</span>
        </a>
        
        <a href="/contacts" className="nav-item">
          <div className="text-2xl mb-1">👥</div>
          <span className="text-xs font-medium">Contacts</span>
        </a>
        
        <a href="/emails" className="nav-item">
          <div className="text-2xl mb-1">📧</div>
          <span className="text-xs font-medium">Email</span>
        </a>
        
        <a href="/dashboard/training" className="nav-item">
          <div className="text-2xl mb-1">🎓</div>
          <span className="text-xs font-medium">Learn</span>
        </a>
        
        <a href="/dashboard/landing-page" className="nav-item">
          <div className="text-2xl mb-1">🌐</div>
          <span className="text-xs font-medium">Page</span>
        </a>
      </nav>
    </div>
  )
} 