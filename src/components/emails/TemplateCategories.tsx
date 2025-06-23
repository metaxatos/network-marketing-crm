'use client'

import { ReactNode } from 'react'
import { 
  SparklesIcon, 
  HeartIcon, 
  ArrowPathIcon, 
  MegaphoneIcon,
  AcademicCapIcon,
  HandThumbUpIcon,
  EnvelopeIcon,
  UsersIcon,
  UserGroupIcon,
  BriefcaseIcon,
  GiftIcon
} from '@heroicons/react/24/outline'

export interface TemplateCategoryConfig {
  id: string
  icon: ReactNode
  iconColor: string
  bgGradient: string
  borderColor: string
  label: string
  description: string
}

export const TEMPLATE_CATEGORIES: Record<string, TemplateCategoryConfig> = {
  customer: {
    id: 'customer',
    icon: <UsersIcon className="w-6 h-6" />,
    iconColor: 'text-purple-600',
    bgGradient: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-200',
    label: 'Customer Emails',
    description: 'Product shares & customer nurturing'
  },
  partner: {
    id: 'partner',
    icon: <BriefcaseIcon className="w-6 h-6" />,
    iconColor: 'text-orange-600',
    bgGradient: 'from-orange-500 to-red-500',
    borderColor: 'border-orange-200',
    label: 'Partner Emails',
    description: 'Business opportunity & recruiting'
  },
  welcome: {
    id: 'welcome',
    icon: <HeartIcon className="w-6 h-6" />,
    iconColor: 'text-pink-600',
    bgGradient: 'from-pink-500 to-rose-500',
    borderColor: 'border-pink-200',
    label: 'Welcome Messages',
    description: 'First impressions that warm hearts'
  },
  follow_up: {
    id: 'follow_up',
    icon: <ArrowPathIcon className="w-6 h-6" />,
    iconColor: 'text-blue-600',
    bgGradient: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-200',
    label: 'Follow Ups',
    description: 'Keep the conversation flowing'
  },
  invitation: {
    id: 'invitation',
    icon: <GiftIcon className="w-6 h-6" />,
    iconColor: 'text-indigo-600',
    bgGradient: 'from-indigo-500 to-purple-500',
    borderColor: 'border-indigo-200',
    label: 'Invitations & Events',
    description: 'Training sessions & presentations'
  },
  training: {
    id: 'training',
    icon: <AcademicCapIcon className="w-6 h-6" />,
    iconColor: 'text-emerald-600',
    bgGradient: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-200',
    label: 'Training & Education',
    description: 'Knowledge that empowers growth'
  },
  thank_you: {
    id: 'thank_you',
    icon: <HandThumbUpIcon className="w-6 h-6" />,
    iconColor: 'text-green-600',
    bgGradient: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-200',
    label: 'Thank You',
    description: 'Gratitude that builds bonds'
  },
  general: {
    id: 'general',
    icon: <EnvelopeIcon className="w-6 h-6" />,
    iconColor: 'text-gray-600',
    bgGradient: 'from-gray-500 to-slate-500',
    borderColor: 'border-gray-200',
    label: 'General',
    description: 'Versatile messages for any occasion'
  }
}

interface TemplateCategoryCardProps {
  category: TemplateCategoryConfig
  isSelected: boolean
  onClick: () => void
  templateCount: number
  isRecommended?: boolean
}

export function TemplateCategoryCard({
  category,
  isSelected,
  onClick,
  templateCount,
  isRecommended
}: TemplateCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden
        w-full p-6 rounded-2xl text-left
        border-2 transition-all duration-300
        ${isSelected 
          ? `${category.borderColor} bg-gradient-to-br ${category.bgGradient} text-white shadow-lg scale-[1.02]` 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]'
        }
      `}
    >
      {/* Recommended Badge */}
      {isRecommended && !isSelected && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
            <SparklesIcon className="w-3 h-3" />
            <span className="text-xs font-medium">Recommended</span>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className={`
        absolute inset-0 opacity-10
        ${isSelected ? 'opacity-20' : 'opacity-5 group-hover:opacity-10'}
        transition-opacity duration-300
      `}>
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-white to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr from-white to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Icon */}
        <div className={`
          w-14 h-14 rounded-xl mb-4
          flex items-center justify-center
          transition-all duration-300
          ${isSelected 
            ? 'bg-white/20 backdrop-blur-sm' 
            : `bg-gradient-to-br ${category.bgGradient} text-white shadow-md group-hover:shadow-lg group-hover:scale-110`
          }
        `}>
          <div className={isSelected ? 'text-white' : ''}>
            {category.icon}
          </div>
        </div>

        {/* Content */}
        <h3 className={`
          font-semibold text-lg mb-1
          ${isSelected ? 'text-white' : 'text-gray-900'}
        `}>
          {category.label}
        </h3>
        <p className={`
          text-sm mb-3
          ${isSelected ? 'text-white/80' : 'text-gray-600'}
        `}>
          {category.description}
        </p>

        {/* Template Count */}
        <div className={`
          inline-flex items-center gap-2
          ${isSelected ? 'text-white/90' : 'text-gray-500'}
        `}>
          <span className="text-sm font-medium">{templateCount} templates</span>
          {templateCount > 0 && (
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${category.bgGradient}
        opacity-0 group-hover:opacity-5 transition-opacity duration-300
        ${isSelected ? 'hidden' : ''}
      `} />
    </button>
  )
}

interface TemplateCategoriesGridProps {
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
  templateCounts: Record<string, number>
  recommendedCategories?: string[]
}

export function TemplateCategoriesGrid({
  selectedCategory,
  onCategorySelect,
  templateCounts,
  recommendedCategories = []
}: TemplateCategoriesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
        <TemplateCategoryCard
          key={key}
          category={category}
          isSelected={selectedCategory === key}
          onClick={() => onCategorySelect(selectedCategory === key ? null : key)}
          templateCount={templateCounts[key] || 0}
          isRecommended={recommendedCategories.includes(key)}
        />
      ))}
    </div>
  )
} 