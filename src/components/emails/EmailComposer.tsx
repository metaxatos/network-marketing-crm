'use client'

import { useState, useMemo } from 'react'
import { 
  UsersIcon, 
  EnvelopeIcon, 
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { EmailTemplate } from '@/types'

import type { Contact } from '@/types'

interface EmailComposerProps {
  contacts: Contact[]
  templates: EmailTemplate[]
  selectedCategory: string | null
  selectedLanguage: 'en' | 'gr'
  onSendEmail: (templateId: string, contactIds: string[]) => Promise<void>
  isSending: boolean
}

export function EmailComposer({
  contacts,
  templates,
  selectedCategory,
  selectedLanguage,
  onSendEmail,
  isSending
}: EmailComposerProps) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Filter templates by category and language
  const filteredTemplates = useMemo(() => {
    const filtered = templates.filter(template => {
      // Check both category and target_audience fields for customer/partner templates
      const matchesCategory = !selectedCategory || 
        template.category === selectedCategory || 
        template.target_audience === selectedCategory
      
      // Since API already filters by language, only filter by category
      console.log('[EmailComposer Debug] Template filter check:', {
        name: template.name,
        templateLang: template.language,
        selectedLang: selectedLanguage,
        matchesCategory,
        included: matchesCategory
      })
      
      return matchesCategory
    })
    
    console.log('[EmailComposer Debug] Filtered templates count:', filtered.length)
    
    // If no templates found, log a helpful message
    if (filtered.length === 0) {
      console.warn('[EmailComposer Debug] No templates found for category:', selectedCategory, 'language:', selectedLanguage)
      console.log('[EmailComposer Debug] Total templates available:', templates.length)
    }
    
    return filtered
  }, [templates, selectedCategory, selectedLanguage])

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => 
      contact.email && (
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }, [contacts, searchQuery])

  // Get selected template data
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)
  const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id))

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id))
    }
  }

  const handleSend = async () => {
    if (!selectedTemplate || selectedContacts.length === 0) return
    
    await onSendEmail(selectedTemplate, selectedContacts)
    
    // Reset selection after sending
    setSelectedContacts([])
    setSelectedTemplate(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'customer': return 'bg-green-100 text-green-700 border-green-200'
      case 'team_member': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Panel 1: Contact Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-gray-600" />
              Select Recipients
            </h3>
            <span className="text-sm text-gray-500">
              {selectedContacts.length} selected
            </span>
          </div>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {filteredContacts.length > 0 && (
            <button
              onClick={handleSelectAllContacts}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedContacts.length === filteredContacts.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>

        {/* Contact List */}
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UsersIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No contacts found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContacts.map(contact => {
                const isSelected = selectedContacts.includes(contact.id)
                const daysSinceContact = contact.last_contacted_at 
                  ? Math.floor((Date.now() - new Date(contact.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
                  : null
                
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleContactToggle(contact.id)}
                    className={`
                      w-full p-3 rounded-lg text-left transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${isSelected ? 'bg-blue-500' : 'bg-gray-200'}
                        transition-colors duration-200
                      `}>
                        {isSelected ? (
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
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
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(contact.status)}`}>
                          {contact.status.replace('_', ' ')}
                        </span>
                        {daysSinceContact !== null && (
                          <span className="text-xs text-gray-400">
                            {daysSinceContact === 0 ? 'Today' : `${daysSinceContact}d ago`}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Panel 2: Template Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <EnvelopeIcon className="w-5 h-5 text-gray-600" />
            Choose Template
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredTemplates.length} templates available
          </p>
        </div>

        {/* Template List */}
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <EnvelopeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No templates in this category</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map(template => {
                const isSelected = selectedTemplate === template.id
                
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`
                      w-full p-4 rounded-lg text-left transition-all duration-200
                      ${isSelected 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-2 h-2 rounded-full mt-2
                        ${isSelected ? 'bg-blue-500' : 'bg-gray-300'}
                        transition-colors duration-200
                      `} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {template.name}
                          </h4>
                          {template.target_audience && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              template.target_audience === 'customer' 
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : template.target_audience === 'partner'
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {template.target_audience}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.subject}
                        </p>
                        
                        {template.usage_count && template.usage_count > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <SparklesIcon className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-500">
                              Used {template.usage_count} times
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Panel 3: Preview & Send */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5 text-gray-600" />
            Preview & Send
          </h3>
        </div>

        <div className="p-4">
          {!selectedTemplate || selectedContacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <PaperAirplaneIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm mb-2">Ready to send?</p>
              <p className="text-xs text-gray-400">
                {!selectedTemplate && selectedContacts.length === 0 
                  ? 'Select recipients and a template'
                  : !selectedTemplate 
                  ? 'Select a template'
                  : 'Select recipients'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Template</p>
                  <p className="font-medium text-gray-900">{selectedTemplateData?.name}</p>
                  <p className="text-sm text-gray-600">{selectedTemplateData?.subject}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Recipients ({selectedContacts.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedContactsData.slice(0, 3).map(contact => (
                      <span key={contact.id} className="px-2 py-1 bg-white rounded text-xs text-gray-700 border border-gray-200">
                        {contact.name}
                      </span>
                    ))}
                    {selectedContactsData.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                        +{selectedContactsData.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Button */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showPreview ? 'Hide Preview' : 'Show Email Preview'}
              </button>

              {/* Email Preview */}
              {showPreview && selectedTemplateData && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-2">PREVIEW</div>
                  <div className="bg-white rounded p-3 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2">
                      {selectedTemplateData.subject}
                    </h5>
                    <div 
                      className="text-sm text-gray-600 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedTemplateData.body_html || selectedTemplateData.body_text || '' 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={isSending}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium text-white
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${isSending 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  }
                `}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Send to {selectedContacts.length} Contact{selectedContacts.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 