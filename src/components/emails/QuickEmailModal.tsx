'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Users, Check, Send, Sparkles, Heart } from 'lucide-react'
import { useContacts } from '@/hooks/queries/useContacts'
import { useSendQuickEmail } from '@/hooks/queries/useEmails'
import { useUserStore } from '@/stores/userStore'

interface QuickEmailModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: 'customer' | 'partner'
  config: {
    icon: string
    title: string
    subtitle: string
    templateName: {
      en: string
      gr: string
    }
    targetAudience: 'customer' | 'partner'
    gradientFrom: string
    gradientTo: string
    iconBg: string
  }
}

export function QuickEmailModal({ 
  isOpen, 
  onClose, 
  actionType, 
  config 
}: QuickEmailModalProps) {
  const [step, setStep] = useState<'contacts' | 'confirm' | 'sending' | 'success'>(isOpen ? 'contacts' : 'contacts')
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [selectedContacts, setSelectedContacts] = useState<any[]>([])
  
  const { data: contacts = [], isLoading: contactsLoading } = useContacts()
  const { mutate: sendQuickEmail, isPending: isSending } = useSendQuickEmail()
  const { member } = useUserStore()
  
  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('contacts')
      setSelectedContactIds([])
      setSelectedContacts([])
    }
  }, [isOpen])

  // Filter contacts based on action type
  const filteredContacts = contacts.filter(contact => {
    if (actionType === 'customer') {
      return contact.status === 'lead' || contact.status === 'customer'
    } else {
      return contact.status === 'lead' || contact.status === 'team_member'
    }
  })

  // Get user's language preference (default to 'en')
  // For now, we'll detect language from browser or use 'en' as default
  const userLanguage = (typeof navigator !== 'undefined' && navigator.language.startsWith('el')) ? 'gr' : 'en'
  const templateName = config.templateName[userLanguage as keyof typeof config.templateName]

  const handleContactSelect = (contact: any) => {
    const isSelected = selectedContactIds.includes(contact.id)
    
    if (isSelected) {
      setSelectedContactIds(prev => prev.filter(id => id !== contact.id))
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id))
    } else {
      setSelectedContactIds(prev => [...prev, contact.id])
      setSelectedContacts(prev => [...prev, contact])
    }
  }

  const handleSendEmail = async () => {
    if (selectedContactIds.length === 0) return
    
    setStep('sending')
    
    try {
      await sendQuickEmail({
        contactIds: selectedContactIds,
        templateName,
        language: userLanguage,
        targetAudience: config.targetAudience,
      })
      
      setStep('success')
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Failed to send email:', error)
      // Handle error - for now just go back to confirm
      setStep('confirm')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-green-100 text-green-800'
      case 'team_member': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'lead': return 'Lead'
      case 'customer': return 'Customer'
      case 'team_member': return 'Team'
      default: return status
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} px-6 py-4`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-lg">{config.icon}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{config.title}</h2>
                <p className="text-white/80 text-sm">{config.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Step 1: Contact Selection */}
          {step === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Select Contacts</h3>
                <span className="text-sm text-gray-500">
                  ({selectedContactIds.length} selected)
                </span>
              </div>

              {contactsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No contacts available for this action</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add some {actionType === 'customer' ? 'leads or customers' : 'leads or team members'} first
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredContacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                        ${selectedContactIds.includes(contact.id) 
                          ? 'bg-blue-50 border-2 border-blue-200' 
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }
                      `}
                    >
                      <div className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center
                        ${selectedContactIds.includes(contact.id) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                        }
                      `}>
                        {selectedContactIds.includes(contact.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                            {getStatusLabel(contact.status)}
                          </span>
                          {contact.email && (
                            <span className="text-xs text-gray-500">{contact.email}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setStep('confirm')}
                  disabled={selectedContactIds.length === 0}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-all duration-200
                    ${selectedContactIds.length > 0
                      ? `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white hover:shadow-lg transform hover:scale-105`
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  Continue ({selectedContactIds.length})
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Ready to Send</h3>
              </div>

              {/* Template Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Email Template</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Template:</strong> {templateName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Recipients:</strong> {selectedContacts.map(c => c.name).join(', ')}
                </p>
              </div>

              {/* Selected Contacts */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Recipients ({selectedContacts.length})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedContacts.map(contact => (
                    <div key={contact.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{contact.name}</p>
                        {contact.email && (
                          <p className="text-xs text-gray-500">{contact.email}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {getStatusLabel(contact.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setStep('contacts')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSendEmail}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2`}
                >
                  <Send className="w-4 h-4" />
                  Send Email
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Sending */}
          {step === 'sending' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sending Email...</h3>
              <p className="text-gray-600">
                Sending to {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''}
              </p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent! 🎉</h3>
              <p className="text-gray-600 mb-4">
                Successfully sent to {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''}
              </p>
              
              {/* Celebration message */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">You're building amazing relationships!</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
} 