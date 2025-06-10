'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { useAppAuth } from '@/hooks/useAuth'
import { useEmailTemplates, useEmailHistory, useSendEmail } from '@/hooks/queries/useEmails'
import { useContacts } from '@/hooks/queries/useContacts'
import { 
  EnvelopeIcon, 
  UserGroupIcon, 
  PaperAirplaneIcon,
  HeartIcon,
  AcademicCapIcon,
  GiftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function EmailsPage() {
  const { user } = useAppAuth()
  
  // React Query hooks
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates()
  const { data: sentEmails = [], isLoading: emailsLoading } = useEmailHistory()
  const { data: contacts = [], isLoading: contactsLoading } = useContacts()
  const { mutate: sendEmail, isPending: isSending } = useSendEmail()
  
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [customSubject, setCustomSubject] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)
  const selectedContactsData = contacts.filter((contact: any) => selectedContacts.includes(contact.id))

  const handleSendEmail = async () => {
    if (!selectedTemplate || selectedContacts.length === 0) return

    setError('')
    setSuccess('')

    try {
      sendEmail(
        {
          templateId: selectedTemplate,
          contactIds: selectedContacts,
          customSubject: customSubject || undefined,
        },
        {
          onSuccess: () => {
            setSuccess(`🎉 Email sent to ${selectedContacts.length} recipient${selectedContacts.length > 1 ? 's' : ''}!`)
            setSelectedTemplate('')
            setSelectedContacts([])
            setCustomSubject('')
          },
          onError: (error: any) => {
            setError(`Failed to send email: ${error.message}`)
          }
        }
      )
    } catch (error) {
      setError('Failed to send email')
    }
  }

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'welcome': return <HeartIcon className="w-7 h-7" />
      case 'follow_up': return <EnvelopeIcon className="w-7 h-7" />
      case 'thank_you': return <SparklesIcon className="w-7 h-7" />
      case 'training': return <AcademicCapIcon className="w-7 h-7" />
      case 'invitation': return <GiftIcon className="w-7 h-7" />
      default: return <EnvelopeIcon className="w-7 h-7" />
    }
  }

  const isLoading = templatesLoading || contactsLoading

  return (
    <DashboardLayout user={user || undefined}>
      <div className="min-h-screen gradient-main">
        {/* Header */}
        <div className="bg-glass-white border-b border-white/20 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-text-primary font-display">
                ✉️ Email Builder
              </h1>
              <p className="text-text-secondary mt-1">
                Create meaningful connections with personalized emails
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Success/Error Messages */}
            {success && (
              <div className="p-4 bg-action-green/10 border border-action-green/20 rounded-2xl">
                <p className="text-action-green font-medium">{success}</p>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-action-coral/10 border border-action-coral/20 rounded-2xl">
                <p className="text-action-coral font-medium">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-glass-white rounded-2xl p-12 space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto animate-shimmer"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-shimmer"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto animate-shimmer"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
                  <div className="h-32 bg-gray-200 rounded-lg animate-shimmer"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
                </div>
              </div>
            )}

            {/* Email Builder */}
            {!isLoading && (
              <>
                {/* Template Selection */}
                <div className="bg-glass-white rounded-2xl p-6">
                  <h2 className="text-2xl font-semibold text-text-primary mb-2">Choose Email Template</h2>
                  <p className="text-text-secondary mb-6">Select from our professionally crafted templates</p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {templates.map((template) => {
                      const isSelected = selectedTemplate === template.id
                      
                      return (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? 'border-action-purple bg-action-purple/5 shadow-purple' 
                              : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                              isSelected ? 'bg-action-purple text-white' : 'bg-gray-100 text-text-light'
                            } transition-colors`}>
                              {getTemplateIcon(template.category)}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-text-primary mb-1">
                                {template.name}
                              </h3>
                              <p className="text-text-secondary text-sm mb-2">
                                {template.subject}
                              </p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                isSelected ? 'bg-action-purple/20 text-action-purple' : 'bg-gray-100 text-text-light'
                              }`}>
                                {template.category.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Subject */}
                {selectedTemplate && (
                  <div className="bg-glass-white rounded-2xl p-6">
                    <h2 className="text-2xl font-semibold text-text-primary mb-2">Customize Subject</h2>
                    <p className="text-text-secondary mb-6">Personalize the subject line (optional)</p>
                    
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder={selectedTemplateData?.subject || "Enter custom subject..."}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-action-purple focus:border-transparent"
                    />
                  </div>
                )}

                {/* Contact Selection */}
                {selectedTemplate && (
                  <div className="bg-glass-white rounded-2xl p-6">
                    <h2 className="text-2xl font-semibold text-text-primary mb-2">Select Recipients</h2>
                    <p className="text-text-secondary mb-6">Choose who will receive your email</p>
                    
                    {contacts.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-action-teal/20 to-action-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <UserGroupIcon className="w-10 h-10 text-action-teal" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-3">No contacts found</h3>
                        <p className="text-text-secondary mb-6">Add contacts to start sending emails</p>
                        <a href="/contacts" className="btn-primary">
                          Add Your First Contact
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {contacts
                          .filter((contact: any) => contact.email)
                          .map((contact: any) => {
                            const isSelected = selectedContacts.includes(contact.id)
                            
                            return (
                              <label
                                key={contact.id}
                                className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                  isSelected 
                                    ? 'border-action-purple bg-action-purple/5 shadow-purple' 
                                    : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedContacts([...selectedContacts, contact.id])
                                    } else {
                                      setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                                    }
                                  }}
                                  className="sr-only"
                                />
                                
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-action-purple to-action-coral text-white flex items-center justify-center font-semibold mr-4">
                                  {contact.name.charAt(0).toUpperCase()}
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className="font-medium text-text-primary">
                                    {contact.name}
                                  </h3>
                                  <p className="text-text-secondary text-sm">
                                    {contact.email}
                                  </p>
                                </div>
                                
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  contact.status === 'lead' ? 'bg-action-golden/10 text-action-golden' :
                                  contact.status === 'customer' ? 'bg-action-green/10 text-action-green' :
                                  contact.status === 'team_member' ? 'bg-action-blue/10 text-action-blue' :
                                  'bg-gray-100 text-text-light'
                                }`}>
                                  {contact.status.replace('_', ' ')}
                                </div>
                              </label>
                            )
                          })}
                      </div>
                    )}
                    
                    {selectedContacts.length > 0 && (
                      <div className="mt-6 p-4 bg-action-purple/5 rounded-2xl border border-action-purple/20">
                        <p className="text-action-purple font-medium">
                          📧 {selectedContacts.length} recipient{selectedContacts.length > 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Send Button */}
                {selectedTemplate && selectedContacts.length > 0 && (
                  <div className="bg-glass-white rounded-2xl p-6 text-center">
                    <button
                      onClick={handleSendEmail}
                      disabled={isSending}
                      className="btn-primary text-lg px-8 py-4 shadow-lg disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <div className="w-5 h-5 bg-white/30 rounded-sm mr-3 animate-shimmer inline-block"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-5 h-5 mr-2 inline-block" />
                          Send Email{selectedContacts.length > 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Sent Emails History */}
            {!emailsLoading && sentEmails.length > 0 && (
              <div className="bg-glass-white rounded-2xl p-6">
                <h2 className="text-2xl font-semibold text-text-primary mb-6">Recent Emails</h2>
                
                <div className="space-y-3">
                  {sentEmails.slice(0, 5).map((email: any) => (
                    <div
                      key={email.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary">
                          {email.subject}
                        </h3>
                        <p className="text-text-secondary text-sm">
                          To: {email.recipient_count} recipient{email.recipient_count > 1 ? 's' : ''}
                        </p>
                        <p className="text-text-light text-sm">
                          {new Date(email.sent_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        email.status === 'sent' ? 'bg-action-green/10 text-action-green' :
                        email.status === 'failed' ? 'bg-action-coral/10 text-action-coral' :
                        'bg-gray-100 text-text-light'
                      }`}>
                        {email.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}