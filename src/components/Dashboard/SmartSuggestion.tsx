'use client'

import { Lightbulb } from 'lucide-react'

interface SmartSuggestionProps {
  suggestion: string
  actionText: string
  onAction: () => void
}

export function SmartSuggestion({ 
  suggestion, 
  actionText, 
  onAction 
}: SmartSuggestionProps) {
  return (
    <section className="smart-suggestion">
      <div className="
        bg-glass border-2 border-purple-300 border-opacity-30 
        rounded-lg p-6 transition-all duration-300
        backdrop-blur-sm
      ">
        <div className="flex items-start gap-4">
          {/* Lightbulb Icon */}
          <div className="flex-shrink-0 mt-1">
            <Lightbulb className="w-6 h-6 text-action-golden" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-medium text-text-primary mb-3">
              Suggested Next Step
            </h3>
            
            <p className="text-text-primary text-lg leading-relaxed mb-4">
              {suggestion}
            </p>

            <button
              onClick={onAction}
              className="
                bg-action-purple text-white px-6 py-3 rounded-full 
                font-medium transition-all duration-300
                hover:bg-purple-600 hover:scale-[0.98] active:scale-95
                focus:outline-none focus:ring-2 focus:ring-action-purple focus:ring-offset-2
              "
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 