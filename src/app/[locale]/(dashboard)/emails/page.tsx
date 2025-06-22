'use client'

import { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { useAppAuth } from '@/hooks/useAuth'
import { useEmailTemplates, useEmailHistory, useSendEmail } from '@/hooks/queries/useEmails'
import { useContacts } from '@/hooks/queries/useContacts'
import { TemplateCategoriesGrid } from '@/components/emails/TemplateCategories'
import { LanguageToggle, LanguageToggleCompact } from '@/components/emails/LanguageToggle'
import { EmailComposer } from '@/components/emails/EmailComposer'
import { 
  EnvelopeIcon, 
  SparklesIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

// Smart template suggestions based on contacts
function getRecommendedCategories(contacts: any[]) {
  const hasNewLeads = contacts.some(c => c.status === 'lead' && !c.last_contacted_at)
  const hasInactiveContacts = contacts.some(c => {
    if (!c.last_contacted_at) return false
    const daysSince = Math.floor((Date.now() - new Date(c.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince > 7
  })
  
  if (hasNewLeads) return ['welcome', 'invitation']
  if (hasInactiveContacts) return ['follow_up']
  return ['general']
}

export default function EmailsPage() {
  const { user } = useAppAuth()
  
  // React Query hooks
  const { 
    data: templates = [], 
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates
  } = useEmailTemplates()
  const { data: sentEmails = [], isLoading: emailsLoading } = useEmailHistory()
  const { data: contacts = [], isLoading: contactsLoading } = useContacts()
  const { mutate: sendEmail, isPending: isSending } = useSendEmail()
  
  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'gr'>('en')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'gr'
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
    } else if (typeof navigator !== 'undefined' && navigator.language.startsWith('el')) {
      setSelectedLanguage('gr')
    }
  }, [])

  // Calculate template counts by category
  const templateCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    
    // Debug: Log all templates to see what we have
    console.log('[Email Templates Debug] All templates:', templates.map(t => ({
      name: t.name,
      category: t.category,
      language: t.language || 'undefined'
    })))
    
    console.log('[Email Templates Debug] Selected language:', selectedLanguage)
    
    templates.forEach(template => {
      if (template.language === selectedLanguage) {
        counts[template.category] = (counts[template.category] || 0) + 1
      }
    })
    
    // If no templates match the selected language, fall back to show all templates
    const totalInLanguage = Object.values(counts).reduce((sum, count) => sum + count, 0)
    if (totalInLanguage === 0) {
      console.log('[Email Templates Debug] No templates found for language', selectedLanguage, 'falling back to all templates')
      templates.forEach(template => {
        counts[template.category] = (counts[template.category] || 0) + 1
      })
    }
    
    console.log('[Email Templates Debug] Final counts:', counts)
    return counts
  }, [templates, selectedLanguage])

  // Get recommended categories
  const recommendedCategories = getRecommendedCategories(contacts)

  // Handle email sending
  const handleSendEmail = async (templateId: string, contactIds: string[]) => {
    return new Promise<void>((resolve, reject) => {
      sendEmail(
        {
          templateId,
          contactIds,
        },
        {
          onSuccess: () => {
            setSuccessMessage(`🎉 Email sent to ${contactIds.length} recipient${contactIds.length > 1 ? 's' : ''}!`)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 5000)
            resolve()
          },
          onError: (error: any) => {
            reject(error)
          }
        }
      )
    })
  }

  const isLoading = templatesLoading || contactsLoading

  return (
    <DashboardLayout user={user || undefined}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        
        {/* Header with Language Toggle */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <EnvelopeIcon className="w-6 h-6 text-white" />
                    </div>
                    Email Center
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Send beautiful emails that build relationships
                  </p>
                </div>
                
                {/* Language Toggle - Desktop */}
                <div className="hidden md:block">
                  <LanguageToggle 
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                  />
                </div>
                
                {/* Language Toggle - Mobile */}
                <div className="block md:hidden">
                  <LanguageToggleCompact
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Success Alert */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-800 font-medium">{successMessage}</p>
                  </div>
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="flex-shrink-0 p-1 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Templates Error State */}
            {templatesError && (
              <div className="bg-white rounded-2xl p-8 text-center space-y-4 shadow-sm border border-gray-200">
                <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto flex items-center justify-center">
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Unable to Load Templates
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We're having trouble loading your email templates. Please try again.
                  </p>
                  <button
                    onClick={() => refetchTemplates()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !templatesError && (
              <div className="space-y-6">
                {/* Categories Skeleton */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                </div>
                
                {/* Composer Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-96 bg-white rounded-2xl shadow-sm border border-gray-200 animate-pulse"></div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Builder */}
            {!isLoading && !templatesError && (
              <div className="space-y-8">
                
                {/* Step 1: Category Selection */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <SparklesIcon className="w-6 h-6 text-yellow-500" />
                      Choose a Category
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Select the type of email you want to send
                    </p>
                  </div>
                  
                  <TemplateCategoriesGrid
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    templateCounts={templateCounts}
                    recommendedCategories={recommendedCategories}
                  />
                </div>

                {/* Step 2: Three-Panel Composer */}
                {templates.length > 0 && (
                  <EmailComposer
                    contacts={contacts}
                    templates={templates}
                    selectedCategory={selectedCategory}
                    selectedLanguage={selectedLanguage}
                    onSendEmail={handleSendEmail}
                    isSending={isSending}
                  />
                )}

                {/* Recent Activity */}
                {!emailsLoading && sentEmails.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <HeartIcon className="w-6 h-6 text-pink-500" />
                        Recent Activity
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Your email sending history
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {sentEmails.slice(0, 5).map((email: any) => (
                        <div
                          key={email.id}
                          className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {email.subject}
                            </h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">
                                To: {email.recipient_count} recipient{email.recipient_count > 1 ? 's' : ''}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(email.sent_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${email.status === 'sent' 
                              ? 'bg-green-100 text-green-700' 
                              : email.status === 'failed' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-gray-100 text-gray-700'
                            }
                          `}>
                            {email.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {templates.length === 0 && !templatesLoading && (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <EnvelopeIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Email Templates Found
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      You need to set up email templates before you can start sending emails. Please contact your administrator.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}