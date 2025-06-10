'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PersonalEmailTemplate } from '@/types'

// Get personal templates
export const usePersonalTemplates = () => {
  return useQuery({
    queryKey: ['personal-templates'],
    queryFn: async (): Promise<PersonalEmailTemplate[]> => {
      const response = await fetch('/api/emails/personal-templates')
      if (!response.ok) {
        throw new Error('Failed to fetch personal templates')
      }
      const result = await response.json()
      return result.data
    }
  })
}

// Duplicate a company template for personal use
export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      template_id, 
      new_name 
    }: { 
      template_id: string
      new_name?: string 
    }): Promise<PersonalEmailTemplate> => {
      const response = await fetch('/api/emails/personal-templates/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template_id, new_name })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to duplicate template')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-templates'] })
    }
  })
}

// Update personal template
export const useUpdatePersonalTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: Partial<PersonalEmailTemplate> 
    }): Promise<PersonalEmailTemplate> => {
      const response = await fetch(`/api/emails/personal-templates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update template')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-templates'] })
    }
  })
}

// Delete personal template
export const useDeletePersonalTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/emails/personal-templates/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete template')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-templates'] })
    }
  })
} 