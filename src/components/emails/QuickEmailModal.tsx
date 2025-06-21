'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Users, Check, Send, Sparkles, Heart, Plus, User, Globe } from 'lucide-react'
import { useContacts, useCreateContact } from '@/hooks/queries/useContacts'
import { useSendQuickEmail } from '@/hooks/queries/useEmails'
import { useUserStore } from '@/stores/userStore'
import toast from 'react-hot-toast'

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
  const [step, setStep] = useState<'contacts' | 'confirm' | 'sending' | 'success'>('contacts')
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [selectedContacts, setSelectedContacts] = useState<any[]>([])
  const [showAddContact, setShowAddContact] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'gr'>('en')
  const [newContactData, setNewContactData] = useState({
    name: '',
    email: ''
  })
  
  const { data: contacts = [], isLoading: contactsLoading } = useContacts()
  const { mutate: sendQuickEmail, isPending: isSending } = useSendQuickEmail()
  const { mutate: createContact, isPending: isCreatingContact } = useCreateContact()
  const { member } = useUserStore()
  
  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('contacts')
      setSelectedContactIds([])
      setSelectedContacts([])
      setShowAddContact(false)
      setSelectedLanguage('en') // Default to English
      setNewContactData({ name: '', email: '' })
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

  // Get template name based on selected language
  const templateName = config.templateName[selectedLanguage]

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

  const handleAddNewContact = async () => {
    if (!newContactData.name.trim()) {
      toast.error('Please enter a name')
      return
    }

    if (!newContactData.email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    try {
      createContact({
        name: newContactData.name.trim(),
        email: newContactData.email.trim(),
        status: 'lead', // Always save as warm lead as requested
        tags: ['email-campaign'], // Tag to show they were added via email campaign
        custom_fields: {}, // Required field
      }, {
        onSuccess: (newContact) => {
          // Add the new contact to selected contacts
          setSelectedContactIds(prev => [...prev, newContact.id])
          setSelectedContacts(prev => [...prev, newContact])
          
          toast.success(`🎉 ${newContact.name} added as warm lead!`)
          
          // Reset form and hide add contact form
          setNewContactData({ name: '', email: '' })
          setShowAddContact(false)
        },
        onError: (error) => {
          console.error('Failed to create contact:', error)
          toast.error('Failed to add contact')
        }
      })
    } catch (error) {
      console.error('Failed to create contact:', error)
      toast.error('Failed to add contact')
    }
  }

  const handleSendEmail = async () => {
    if (selectedContactIds.length === 0) return
    
    setStep('sending')
    
    try {
      await sendQuickEmail({
        contactIds: selectedContactIds,
        language: selectedLanguage,
        targetAudience: config.targetAudience,
      })
      
      setStep('success')
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Failed to send email:', error)
      toast.error('Failed to send email')
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`
          bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} 
          px-6 py-4 flex items-center justify-between text-white
        `}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              {config.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold">{config.title}</h2>
              <p className="text-white/80 text-sm">{config.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'contacts' && (
            <div className="space-y-4">
              {/* Language Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4" />
                  Select Email Language
                </h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedLanguage('en')}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${selectedLanguage === 'en' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-300'
                      }
                    `}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('gr')}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${selectedLanguage === 'gr' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-300'
                      }
                    `}
                  >
                    🇬🇷 Ελληνικά
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Template: {templateName}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  Select Recipients ({selectedContactIds.length} selected)
                </h3>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {showAddContact ? 'Cancel' : 'Add New Contact'}
                </button>
              </div>

              {/* Add New Contact Form */}
              {showAddContact && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-blue-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Add New Contact (will be saved as warm lead)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full name *"
                      value={newContactData.name}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Email address *"
                      value={newContactData.email}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                      className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleAddNewContact}
                    disabled={isCreatingContact || !newContactData.name.trim() || !newContactData.email.trim()}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreatingContact ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add & Select
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Contact List */}
              <div className="border border-gray-200 rounded-xl max-h-64 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No contacts available for this action</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add some {actionType === 'customer' ? 'leads or customers' : 'leads or team members'} first
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
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
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {contact.email}
                          </p>
                        </div>
                        
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                          {getStatusLabel(contact.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setStep('confirm')}
                disabled={selectedContactIds.length === 0}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                Continue ({selectedContactIds.length})
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Send!</h3>
                <p className="text-gray-600">
                  Send <strong>{templateName}</strong> to <strong>{selectedContacts.length}</strong> contact{selectedContacts.length > 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Recipients:</h4>
                <div className="space-y-1">
                  {selectedContacts.map(contact => (
                    <div key={contact.id} className="text-sm text-gray-600 flex items-center justify-between">
                      <span>{contact.name}</span>
                      <span className="text-xs text-gray-400">{contact.email}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('contacts')}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Email
                </button>
              </div>
            </div>
          )}

          {step === 'sending' && (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sending Email...</h3>
                <p className="text-gray-600">Please wait while we send your email</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Email Sent Successfully!
                </h3>
                <p className="text-gray-600">
                  Your email has been sent to {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">You're building amazing relationships!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 