'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/userStore'

interface MemberSetupProps {
  onComplete: () => void
}

export default function MemberSetup({ onComplete }: MemberSetupProps) {
  const { member, updateMember, checkUsernameAvailability } = useUserStore()
  const [formData, setFormData] = useState({
    email: member?.email || '',
    phone: member?.phone || '',
    username: member?.username || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    if (!validateUsername(username)) {
      setUsernameAvailable(false)
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
    setFormData(prev => ({ ...prev, username: cleaned }))
    
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

    console.log('[MemberSetup] Form submission started with data:', formData)

    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.phone || !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (!formData.username || !validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-30 characters, lowercase letters, numbers, hyphens, and underscores only'
    } else if (usernameAvailable === false) {
      newErrors.username = 'This username is already taken'
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('[MemberSetup] Form validation errors:', newErrors)
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      console.log('[MemberSetup] Calling updateMember...')
      const result = await updateMember(formData)
      
      console.log('[MemberSetup] updateMember result:', result)
      
      if (result.success) {
        console.log('[MemberSetup] Member update successful, calling onComplete')
        onComplete()
      } else {
        console.error('[MemberSetup] Member update failed:', result.error)
        setErrors({ general: result.error || 'Update failed' })
      }
    } catch (error) {
      console.error('[MemberSetup] Form submission error:', error)
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Let's set up your contact information and unique username for your affiliate links
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="your-username"
              value={formData.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.username ? 'border-red-500' : usernameAvailable === true ? 'border-green-500' : 'border-gray-300'
              }`}
            />
            {usernameChecking && (
              <p className="text-sm text-gray-500">Checking availability...</p>
            )}
            {usernameAvailable === true && (
              <p className="text-sm text-green-500">✓ Username is available!</p>
            )}
            {usernameAvailable === false && formData.username.length >= 3 && (
              <p className="text-sm text-red-500">✗ Username is taken</p>
            )}
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
            <p className="text-xs text-gray-500">
              This will be used for your affiliate links: yoursite.com/{formData.username || 'username'}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || usernameAvailable === false}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  )
} 