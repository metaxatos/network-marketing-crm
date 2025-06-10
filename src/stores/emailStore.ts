import { create } from 'zustand'
import type { EmailTemplate, SentEmail } from '@/types'

interface EmailStore {
  // State
  templates: EmailTemplate[]
  sentEmails: SentEmail[]
  analytics: any[]
  clickMetrics: any | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadTemplates: () => Promise<void>
  loadSentEmails: () => Promise<void>
  loadAnalytics: (days?: number) => Promise<void>
  getEmailAnalytics: (emailId: string) => Promise<any>
  getTemplateAnalytics: (templateId: string, days?: number) => Promise<any>
  getContactClickHistory: (contactId: string) => Promise<any>
  sendEmail: (params: {
    templateId: string
    contactId: string
    customVariables?: Record<string, string>
    customSubject?: string
  }) => Promise<{ success: boolean; error?: string }>
  createTemplate: (template: any) => Promise<void>
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  clearError: () => void
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  // Initial state
  templates: [],
  sentEmails: [],
  analytics: [],
  clickMetrics: null,
  isLoading: false,
  error: null,

  // Load email templates
  loadTemplates: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/email-templates')
      
      if (!response.ok) {
        throw new Error('Failed to load templates')
      }

      const data = await response.json()
      set({ templates: data.templates || [], isLoading: false })
    } catch (error) {
      console.error('Error loading templates:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load templates',
        isLoading: false 
      })
    }
  },

  // Load sent emails
  loadSentEmails: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/emails/history')
      
      if (!response.ok) {
        throw new Error('Failed to load sent emails')
      }

      const data = await response.json()
      set({ sentEmails: data.emails || [], isLoading: false })
    } catch (error) {
      console.error('Error loading sent emails:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load sent emails',
        isLoading: false 
      })
    }
  },

  // Send email
  sendEmail: async ({ templateId, contactId, customVariables = {}, customSubject }) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          contactId,
          customVariables,
          customSubject
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        set({ isLoading: false })
        return { success: false, error: result.error || 'Failed to send email' }
      }

      // Refresh sent emails list
      await get().loadSentEmails()

      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: 'Failed to send email' }
    }
  },

  // Create template (placeholder - not implemented in API yet)
  createTemplate: async (template: any) => {
    console.log('createTemplate called:', template)
    // TODO: Implement when template management API is added
  },

  // Update template (placeholder - not implemented in API yet)
  updateTemplate: async (id: string, updates: Partial<EmailTemplate>) => {
    console.log('updateTemplate called:', id, updates)
    // TODO: Implement when template management API is added
  },

  // Delete template (placeholder - not implemented in API yet)
  deleteTemplate: async (id: string) => {
    console.log('deleteTemplate called:', id)
    // TODO: Implement when template management API is added
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Analytics methods
  loadAnalytics: async (days = 30) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch(`/api/emails/analytics?days=${days}`)
      const data = await response.json()
      
      if (data.success && data.data.type === 'metrics') {
        set({ clickMetrics: data.data.data })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load analytics' })
    } finally {
      set({ isLoading: false })
    }
  },

  getEmailAnalytics: async (emailId: string) => {
    try {
      const response = await fetch(`/api/emails/analytics?emailId=${emailId}`)
      const data = await response.json()
      
      if (data.success && data.data.type === 'email') {
        return data.data.data
      }
      throw new Error('Failed to get email analytics')
    } catch (error) {
      throw error
    }
  },

  getTemplateAnalytics: async (templateId: string, days = 30) => {
    try {
      const response = await fetch(`/api/emails/analytics?templateId=${templateId}&days=${days}`)
      const data = await response.json()
      
      if (data.success && data.data.type === 'template') {
        return data.data.data
      }
      throw new Error('Failed to get template analytics')
    } catch (error) {
      throw error
    }
  },

  getContactClickHistory: async (contactId: string) => {
    try {
      const response = await fetch(`/api/emails/analytics?contactId=${contactId}`)
      const data = await response.json()
      
      if (data.success && data.data.type === 'contact') {
        return data.data.data
      }
      throw new Error('Failed to get contact click history')
    } catch (error) {
      throw error
    }
  }
})) 