'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import type { EmailTemplate, EmailHistory } from '@/types'

// Email templates query
export const useEmailTemplates = () => {
  return useQuery({
    queryKey: queryKeys.emailTemplates(),
    queryFn: async () => {
      const response = await fetch('/api/emails/templates')
      if (!response.ok) {
        throw new Error('Failed to fetch email templates')
      }
      
      const data = await response.json()
      return data.templates as EmailTemplate[]
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (templates don't change often)
  })
}

// Email history query
export const useEmailHistory = (filters?: {
  page?: number
  status?: string
}) => {
  return useQuery({
    queryKey: queryKeys.emailHistory(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.status) params.append('status', filters.status)
      
      const response = await fetch(`/api/emails/history?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch email history')
      }
      
      const data = await response.json()
      return data.emails as EmailHistory[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Email stats query
export const useEmailStats = () => {
  return useQuery({
    queryKey: queryKeys.emailStats(),
    queryFn: async () => {
      const response = await fetch('/api/emails/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch email stats')
      }
      
      const data = await response.json()
      return data.stats
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Send email mutation
export const useSendEmail = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      to,
      templateId,
      customSubject,
      customContent,
      contactIds,
    }: {
      to?: string[]
      templateId?: string
      customSubject?: string
      customContent?: string
      contactIds?: string[]
    }) => {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          templateId,
          customSubject,
          customContent,
          contactIds,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send email')
      }
      
      const result = await response.json()
      return result
    },
    onMutate: async (emailData) => {
      // Optimistically add to email history
      const optimisticEmail = {
        id: `temp-${Date.now()}`,
        subject: emailData.customSubject || 'Email sent',
        status: 'sending',
        sent_at: new Date().toISOString(),
        recipient_count: emailData.to?.length || emailData.contactIds?.length || 0,
      }
      
      // Update email history queries
      const queryCache = queryClient.getQueryCache()
      const historyQueries = queryCache.findAll({ 
        queryKey: queryKeys.emails,
        type: 'active'
      })
      
      historyQueries.forEach((query) => {
        if (query.queryKey.includes('history')) {
          const oldData = queryClient.getQueryData(query.queryKey)
          if (Array.isArray(oldData)) {
            queryClient.setQueryData(query.queryKey, [optimisticEmail, ...oldData])
          }
        }
      })
      
      return { optimisticEmail }
    },
    onError: (err, emailData, context) => {
      // Remove optimistic email on error
      if (context?.optimisticEmail) {
        const queryCache = queryClient.getQueryCache()
        const historyQueries = queryCache.findAll({ 
          queryKey: queryKeys.emails,
          type: 'active'
        })
        
        historyQueries.forEach((query) => {
          if (query.queryKey.includes('history')) {
            const oldData = queryClient.getQueryData(query.queryKey)
            if (Array.isArray(oldData)) {
              const filteredData = oldData.filter(
                (email: any) => email.id !== context.optimisticEmail.id
              )
              queryClient.setQueryData(query.queryKey, filteredData)
            }
          }
        })
      }
    },
    onSettled: () => {
      // Refetch email history and stats
      queryClient.invalidateQueries({ queryKey: queryKeys.emails })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// Create email template mutation
export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (templateData: Omit<EmailTemplate, 'id' | 'member_id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch('/api/emails/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create email template')
      }
      
      const result = await response.json()
      return result.template as EmailTemplate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates() })
    },
  })
}

// Update email template mutation
export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailTemplate> }) => {
      const response = await fetch(`/api/emails/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update email template')
      }
      
      const result = await response.json()
      return result.template as EmailTemplate
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.emailTemplates() })
      
      // Get current data
      const previousTemplates = queryClient.getQueryData(queryKeys.emailTemplates())
      
      // Optimistically update
      if (Array.isArray(previousTemplates)) {
        const updatedTemplates = previousTemplates.map((template: EmailTemplate) =>
          template.id === id 
            ? { ...template, ...updates, updated_at: new Date().toISOString() }
            : template
        )
        queryClient.setQueryData(queryKeys.emailTemplates(), updatedTemplates)
      }
      
      return { previousTemplates }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousTemplates) {
        queryClient.setQueryData(queryKeys.emailTemplates(), context.previousTemplates)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates() })
    },
  })
}

// Delete email template mutation
export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/emails/templates/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete email template')
      }
      
      return { id }
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.emailTemplates() })
      
      // Get current data
      const previousTemplates = queryClient.getQueryData(queryKeys.emailTemplates())
      
      // Optimistically remove
      if (Array.isArray(previousTemplates)) {
        const filteredTemplates = previousTemplates.filter((template: EmailTemplate) => template.id !== id)
        queryClient.setQueryData(queryKeys.emailTemplates(), filteredTemplates)
      }
      
      return { previousTemplates }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousTemplates) {
        queryClient.setQueryData(queryKeys.emailTemplates(), context.previousTemplates)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates() })
    },
  })
} 