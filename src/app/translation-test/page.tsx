'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

export default function TranslationTestPage() {
  const { t, language, isGreek, isEnglish } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Translation System Demo
              </h1>
              <p className="text-gray-600">
                Current Language: <span className="font-semibold">{language.toUpperCase()}</span>
                {isGreek && ' (Greek)'}
                {isEnglish && ' (English)'}
              </p>
            </div>
            
            <LanguageToggle />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Navigation Translations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Navigation
              </h2>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Dashboard:</span> {t('nav.dashboard')}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Contacts:</span> {t('nav.contacts')}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Emails:</span> {t('nav.emails')}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Team:</span> {t('nav.team')}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Events:</span> {t('nav.events')}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Training:</span> {t('nav.training')}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Settings:</span> {t('nav.settings')}
                </div>
              </div>
            </div>

            {/* Dashboard Translations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Dashboard
              </h2>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Title:</span> {t('dashboard.title')}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Quick Actions:</span> {t('dashboard.quickActions')}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Welcome Back:</span> {t('dashboard.welcomeBack')}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Recent Activity:</span> {t('dashboard.recentActivity')}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Greeting (Morning):</span> {t('dashboard.greeting.morning')}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Send Email:</span> {t('dashboard.sendEmail')}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">My Contacts:</span> {t('dashboard.myContacts')}
                </div>
              </div>
            </div>

            {/* Common UI Elements */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Common UI
              </h2>
              <div className="space-y-2">
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Save:</span> {t('common.save')}
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Cancel:</span> {t('common.cancel')}
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Loading:</span> {t('common.loading')}
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Success:</span> {t('common.success')}
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Error:</span> {t('common.error')}
                </div>
              </div>
            </div>

            {/* Interpolation Examples */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Dynamic Values
              </h2>
              <div className="space-y-2">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Contact Count:</span> {t('dashboard.contactsCount', { count: 25 })}
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Progress:</span> {t('training.progress', { percent: 75 })}
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Success Message:</span> {t('success.saved')}
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Error Message:</span> {t('errors.required')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Language Toggle Variations */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Language Toggle Variations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-medium text-gray-700 mb-4">Default</h3>
              <LanguageToggle />
            </div>
            
            <div className="text-center">
              <h3 className="font-medium text-gray-700 mb-4">Compact</h3>
              <LanguageToggle compact={true} />
            </div>
            
            <div className="text-center">
              <h3 className="font-medium text-gray-700 mb-4">No Label</h3>
              <LanguageToggle showLabel={false} />
            </div>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Implementation Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600">✅ Completed</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Global language store (Zustand)</li>
                <li>• Translation files (EN/GR)</li>
                <li>• Translation hook</li>
                <li>• Language toggle component</li>
                <li>• Navigation translations</li>
                <li>• Dashboard translations (partial)</li>
                <li>• Browser language detection</li>
                <li>• localStorage persistence</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-orange-600">🚧 In Progress</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Complete dashboard translation</li>
                <li>• Contacts page translation</li>
                <li>• Team page translation</li>
                <li>• Events page translation</li>
                <li>• Training page translation</li>
                <li>• Settings page translation</li>
                <li>• Form validations</li>
                <li>• Error messages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}