'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { useAppAuth } from '@/hooks/useAuth'
import { useEmailTemplates } from '@/hooks/queries/useEmails'
import { usePersonalTemplates } from '@/hooks/queries/usePersonalTemplates'
import { useContacts } from '@/hooks/queries/useContacts'
import { TemplateCustomizer } from '@/components/emails/template-customizer'
import { BulkEmailSender } from '@/components/emails/bulk-email-sender'
import { Button } from '@/components/ui/button'
import { 
  EnvelopeIcon, 
  UserGroupIcon, 
  PlusIcon,
  SparklesIcon,
  HeartIcon,
  AcademicCapIcon,
  GiftIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { EmailTemplate, PersonalEmailTemplate } from '@/types'

type ViewMode = 'overview' | 'customize' | 'bulk-send'

export default function AdvancedEmailsPage() {
  const { user } = useAppAuth()
  
  // React Query hooks
  const { data: companyTemplates = [], isLoading: templatesLoading } = useEmailTemplates()
  const { data: personalTemplates = [], isLoading: personalLoading } = usePersonalTemplates()
  const { data: contacts = [], isLoading: contactsLoading } = useContacts()
  
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedTemplate, setSelectedTemplate] = useState<{
    template: EmailTemplate | PersonalEmailTemplate
    isPersonal: boolean
  } | null>(null)

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'welcome': return <HeartIcon className="w-6 h-6" />
      case 'follow_up': return <EnvelopeIcon className="w-6 h-6" />
      case 'thank_you': return <SparklesIcon className="w-6 h-6" />
      case 'training': return <AcademicCapIcon className="w-6 h-6" />
      case 'invitation': return <GiftIcon className="w-6 h-6" />
      default: return <EnvelopeIcon className="w-6 h-6" />
    }
  }

  const handleTemplateSelect = (template: EmailTemplate | PersonalEmailTemplate, isPersonal: boolean) => {
    setSelectedTemplate({ template, isPersonal })
    setViewMode('customize')
  }

  const handleTemplateSaved = () => {
    setViewMode('overview')
    setSelectedTemplate(null)
  }

  const isLoading = templatesLoading || personalLoading || contactsLoading

  // Customize Template View
  if (viewMode === 'customize' && selectedTemplate) {
    return (
      <DashboardLayout user={user || undefined}>
        <div className="min-h-screen gradient-main">
          <div className="bg-glass-white border-b border-white/20 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Button
                  onClick={() => setViewMode('overview')}
                  variant="secondary"
                  className="text-sm"
                >
                  ← Back to Templates
                </Button>
              </div>
            </div>
          </div>
          
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <TemplateCustomizer
                template={selectedTemplate.template}
                isPersonalTemplate={selectedTemplate.isPersonal}
                onSave={handleTemplateSaved}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Bulk Send View
  if (viewMode === 'bulk-send') {
    return (
      <DashboardLayout user={user || undefined}>
        <div className="min-h-screen gradient-main">
          <div className="bg-glass-white border-b border-white/20 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Button
                  onClick={() => setViewMode('overview')}
                  variant="secondary"
                  className="text-sm"
                >
                  ← Back to Templates
                </Button>
              </div>
            </div>
          </div>
          
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <BulkEmailSender
                contacts={contacts}
                onClose={() => setViewMode('overview')}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Overview Mode
  return (
    <DashboardLayout user={user || undefined}>
      <div className="min-h-screen gradient-main">
        {/* Header */}
        <div className="bg-glass-white border-b border-white/20 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary font-display">
                    ✉️ Advanced Email Center
                  </h1>
                  <p className="text-text-secondary mt-1">
                    Customize templates and send bulk emails with ease
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => setViewMode('bulk-send')}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  >
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Bulk Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-8">
            
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
              </div>
            )}

            {!isLoading && (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-glass-white rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-text-primary">{companyTemplates.length}</h3>
                        <p className="text-text-secondary text-sm">Company Templates</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-glass-white rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <WrenchScrewdriverIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-text-primary">{personalTemplates.length}</h3>
                        <p className="text-text-secondary text-sm">My Templates</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-glass-white rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-text-primary">{contacts.length}</h3>
                        <p className="text-text-secondary text-sm">Total Contacts</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Templates */}
                <div className="bg-glass-white rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-text-primary">Company Templates</h2>
                      <p className="text-text-secondary">Professional templates created for your company</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {companyTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            {getTemplateIcon(template.category)}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary text-sm">
                              {template.name}
                            </h3>
                            <p className="text-text-secondary text-xs mb-2">
                              {template.subject}
                            </p>
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                              {template.category.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleTemplateSelect(template, false)}
                          variant="secondary"
                          className="w-full text-sm"
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-2" />
                          Customize
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personal Templates */}
                {personalTemplates.length > 0 && (
                  <div className="bg-glass-white rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-text-primary">My Templates</h2>
                        <p className="text-text-secondary">Your personalized template variations</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {personalTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="border border-purple-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:border-purple-300 bg-purple-50/30"
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                              <WrenchScrewdriverIcon className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-text-primary text-sm">
                                {template.name}
                              </h3>
                              <p className="text-text-secondary text-xs mb-2">
                                {template.subject}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                  Personal
                                </span>
                                {template.is_favorite && (
                                  <span className="text-yellow-500">⭐</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleTemplateSelect(template, true)}
                            variant="secondary"
                            className="w-full text-sm"
                          >
                            <Cog6ToothIcon className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State for Personal Templates */}
                {personalTemplates.length === 0 && (
                  <div className="bg-glass-white rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <PlusIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      No Personal Templates Yet
                    </h3>
                    <p className="text-text-secondary mb-6 max-w-md mx-auto">
                      Customize company templates to create your own personalized versions. 
                      Click "Customize" on any company template above to get started!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 