'use client'

import { useState } from 'react'
import { Mail, Users, Heart, Sparkles } from 'lucide-react'
import { QuickEmailModal } from '@/components/emails/QuickEmailModal'

interface QuickEmailActionsProps {
  className?: string
}

const QUICK_ACTION_CONFIG = {
  customer: {
    icon: '🛍️',
    title: 'Email a Customer',
    subtitle: 'Share product benefits',
    color: 'purple',
    templateName: {
      en: 'Customer Email - Personal Product Share',
      gr: 'Email Πελάτη - Προσωπική Κοινοποίηση Προϊόντος'
    },
    targetAudience: 'customer' as const,
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
    shadowColor: 'shadow-purple-500/25',
    hoverShadow: 'hover:shadow-purple-500/40',
    iconBg: 'bg-purple-500',
    ringColor: 'ring-purple-500/20'
  },
  partner: {
    icon: '🤝',
    title: 'Email a Partner',
    subtitle: 'Share the opportunity',
    color: 'coral',
    templateName: {
      en: 'Partner Email - Personal Business Share',
      gr: 'Email Συνεργάτη - Προσωπική Επιχειρηματική Κοινοποίηση'
    },
    targetAudience: 'partner' as const,
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500',
    shadowColor: 'shadow-orange-500/25',
    hoverShadow: 'hover:shadow-orange-500/40',
    iconBg: 'bg-orange-500',
    ringColor: 'ring-orange-500/20'
  }
}

export function QuickEmailActions({ className = '' }: QuickEmailActionsProps) {
  const [selectedAction, setSelectedAction] = useState<'customer' | 'partner' | null>(null)
  
  const handleActionClick = (actionType: 'customer' | 'partner') => {
    setSelectedAction(actionType)
  }

  const handleCloseModal = () => {
    setSelectedAction(null)
  }

  return (
    <>
      {/* Quick Email Actions Section */}
      <div className={`space-y-4 ${className}`}>
        {/* Section Header with Sparkle */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Quick Email Actions
          </h2>
          <div className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
            <span className="text-xs font-medium text-purple-700">New!</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(QUICK_ACTION_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleActionClick(key as 'customer' | 'partner')}
              className={`
                group relative overflow-hidden
                bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo}
                rounded-2xl p-6 text-white
                transform transition-all duration-300 ease-out
                hover:scale-[1.02] hover:-translate-y-1
                ${config.shadowColor} shadow-lg ${config.hoverShadow}
                ring-1 ${config.ringColor}
                active:scale-[0.98] active:translate-y-0
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent
              `}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Sparkle effect on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-4 h-4 text-white/60" />
              </div>

              <div className="relative flex items-center gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                    <span className="text-2xl">{config.icon}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <h3 className="font-display text-lg font-semibold mb-1 group-hover:scale-105 transition-transform duration-300">
                    {config.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {config.subtitle}
                  </p>
                  
                  {/* Action indicator */}
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Mail className="w-4 h-4 text-white/60" />
                    <span className="text-xs text-white/60">Click to send</span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 transform group-hover:translate-x-1 transition-transform duration-300">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom highlight */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        {/* Success encouragement */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                Make someone's day brighter! 
              </p>
              <p className="text-xs text-green-600 mt-1">
                Every email you send builds stronger relationships
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Email Modal */}
      {selectedAction && (
        <QuickEmailModal
          isOpen={!!selectedAction}
          onClose={handleCloseModal}
          actionType={selectedAction}
          config={QUICK_ACTION_CONFIG[selectedAction]}
        />
      )}
    </>
  )
} 