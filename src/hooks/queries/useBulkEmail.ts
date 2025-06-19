'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Communication } from '@/types'

// Simplified bulk email job interface for new structure
interface BulkEmailResult {
  job_id: string
  total_emails: number
  sent_count: number
  failed_count: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

// Send bulk emails
export const useSendBulkEmails = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      contact_ids, 
      template_id, 
      personal_template_id, 
      custom_variables = {} 
    }: { 
      contact_ids: string[]
      template_id?: string
      personal_template_id?: string
      custom_variables?: Record<string, any>
    }): Promise<{ job_id: string }> => {
      const response = await fetch('/api/emails/bulk-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          contact_ids, 
          template_id, 
          personal_template_id, 
          custom_variables 
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send bulk emails')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-email-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['communications'] })
      queryClient.invalidateQueries({ queryKey: ['email-history'] })
    }
  })
}

// Get bulk email job status
export const useBulkEmailJob = (jobId: string | null) => {
  return useQuery({
    queryKey: ['bulk-email-job', jobId],
    queryFn: async (): Promise<BulkEmailResult> => {
      if (!jobId) throw new Error('Job ID is required')
      
      const response = await fetch(`/api/emails/bulk-send?job_id=${jobId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch bulk email job')
      }
      
      const result = await response.json()
      return result.data
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Stop polling when job is completed or failed
      if (query.state.data?.status === 'completed' || query.state.data?.status === 'failed') {
        return false
      }
      // Poll every 2 seconds while processing
      return 2000
    }
  })
}

// Get all bulk email jobs for the user (simplified - returns recent communications)
export const useBulkEmailJobs = () => {
  return useQuery({
    queryKey: ['bulk-email-jobs'],
    queryFn: async (): Promise<BulkEmailResult[]> => {
      // Note: This could be simplified to query communications table
      // For now, keeping compatibility with existing API structure
      const response = await fetch('/api/emails/bulk-jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch bulk email jobs')
      }
      
      const result = await response.json()
      return result.data
    }
  })
}

// NEW: Get recent bulk communications (alternative approach)
export const useBulkCommunications = () => {
  return useQuery({
    queryKey: ['bulk-communications'],
    queryFn: async (): Promise<Communication[]> => {
      const response = await fetch('/api/emails/history?type=bulk')
      if (!response.ok) {
        throw new Error('Failed to fetch bulk communications')
      }
      
      const result = await response.json()
      return result.data
    }
  })
} 