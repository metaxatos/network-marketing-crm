import type { Contact } from '@/types'

// Smart template category recommendations based on contact data
export function getRecommendedCategories(contacts: Contact[]): string[] {
  const hasNewLeads = contacts.some(c => c.status === 'lead' && !c.last_contacted_at)
  const hasInactiveContacts = contacts.some(c => {
    if (!c.last_contacted_at) return false
    const daysSince = Math.floor((Date.now() - new Date(c.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince > 7
  })
  const hasCustomers = contacts.some(c => c.status === 'customer')
  
  const recommendations: string[] = []
  
  if (hasNewLeads) {
    recommendations.push('welcome', 'invitation')
  }
  
  if (hasInactiveContacts) {
    recommendations.push('follow_up')
  }
  
  if (hasCustomers) {
    recommendations.push('thank_you', 'training')
  }
  
  // If no specific recommendations, suggest general
  if (recommendations.length === 0) {
    recommendations.push('general')
  }
  
  return [...new Set(recommendations)] // Remove duplicates
}

// Get user's detected language preference
export function getUserLanguagePreference(): 'en' | 'gr' {
  // Check localStorage first
  const saved = localStorage.getItem('preferredLanguage') as 'en' | 'gr' | null
  if (saved) return saved
  
  // Check browser language
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('el') || browserLang.startsWith('gr')) {
      return 'gr'
    }
  }
  
  return 'en'
}

// Format contact status for display
export function formatContactStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Calculate days since last contact
export function getDaysSinceContact(lastContactedAt: string | null | undefined): number | null {
  if (!lastContactedAt) return null
  
  const days = Math.floor((Date.now() - new Date(lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))
  return days
}

// Format days since contact for display
export function formatDaysSinceContact(days: number | null): string {
  if (days === null) return 'Never contacted'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return 'Over a year ago'
} 