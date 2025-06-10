'use client'

import { useState } from 'react'
import { useCreateContact } from '@/hooks/queries/useContacts'
import type { ContactStatus } from '@/types'
import { X, User, Mail, Phone, Tag, Target, Star, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddContactModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddContactModal({ onClose, onSuccess }: AddContactModalProps) {
  const createContactMutation = useCreateContact()
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'lead' as ContactStatus,
    tags: [] as string[],
    custom_fields: {}
  })

  const [tagInput, setTagInput] = useState('')

  const statusOptions = [
    { value: 'lead' as ContactStatus, label: 'Lead', icon: <Target className="w-4 h-4" />, color: 'action-purple' },
    { value: 'customer' as ContactStatus, label: 'Customer', icon: <Star className="w-4 h-4" />, color: 'action-green' },
    { value: 'team_member' as ContactStatus, label: 'Team Member', icon: <Users className="w-4 h-4" />, color: 'action-coral' },
    { value: 'prospect' as ContactStatus, label: 'Prospect', icon: <User className="w-4 h-4" />, color: 'action-blue' },
  ]

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    try {
      await createContactMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        status: formData.status,
        tags: formData.tags,
        custom_fields: formData.custom_fields
      })

      toast.success(`🎉 ${formData.name} added to your network!`)
      onSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add contact'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-display font-bold text-text-primary">
              Add New Contact
            </h2>
            <p className="text-text-secondary mt-1">Build your network, one connection at a time</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-action-coral/10 border border-action-coral/20 rounded-xl p-4 text-action-coral text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                placeholder="Enter contact name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
              <input
                type="tel"
                className="w-full pl-11 pr-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: option.value }))}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300
                    ${formData.status === option.value
                      ? `bg-${option.color}/10 border-${option.color}/30 text-${option.color}`
                      : 'bg-white/30 border-white/20 text-text-secondary hover:bg-white/50'
                    }
                  `}
                >
                  {option.icon}
                  <span className="font-medium text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Tags
            </label>
            <div className="space-y-3">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
                <input
                  type="text"
                  className="w-full pl-11 pr-20 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-action-purple text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-action-purple/80 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-action-purple/10 text-action-purple border border-action-purple/20 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-action-purple/20 rounded-full p-0.5 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/50 border-2 border-white/20 text-text-secondary font-semibold rounded-xl hover:bg-white/70 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-action-purple text-white font-semibold rounded-xl shadow-purple hover:shadow-purple-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 