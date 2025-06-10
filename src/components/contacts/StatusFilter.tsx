'use client'

import { useContactStore } from '@/stores/contactStore'
import { useContacts } from '@/hooks/queries/useContacts'
import type { ContactStatus } from '@/types'
import { Users, Target, Star, UserCheck } from 'lucide-react'

const statusOptions: { value: ContactStatus | 'all', label: string, icon: React.ReactNode, color: string }[] = [
  { value: 'all', label: 'All Contacts', icon: <Users className="w-4 h-4" />, color: 'text-text-secondary border-white/20 bg-glass hover:bg-white/80' },
  { value: 'lead', label: 'Leads', icon: <Target className="w-4 h-4" />, color: 'text-action-purple border-action-purple/20 bg-action-purple/10 hover:bg-action-purple/20' },
  { value: 'customer', label: 'Customers', icon: <Star className="w-4 h-4" />, color: 'text-action-green border-action-green/20 bg-action-green/10 hover:bg-action-green/20' },
  { value: 'team_member', label: 'Team Members', icon: <UserCheck className="w-4 h-4" />, color: 'text-action-coral border-action-coral/20 bg-action-coral/10 hover:bg-action-coral/20' },
]

export function StatusFilter() {
  // UI state from store
  const { statusFilter, filterByStatus } = useContactStore()
  
  // Server state from React Query
  const { data: contacts = [] } = useContacts()

  const getCount = (status: ContactStatus | 'all') => {
    if (status === 'all') return contacts.length
    return contacts.filter((contact: any) => contact.status === status).length
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {statusOptions.map((option) => {
        const count = getCount(option.value)
        const isActive = statusFilter === option.value
        
        return (
          <button
            key={option.value}
            onClick={() => filterByStatus(option.value)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium 
              border-2 backdrop-blur-md transition-all duration-300 whitespace-nowrap
              min-h-[44px] 
              ${isActive 
                ? option.value === 'all' 
                  ? 'bg-action-purple text-white border-action-purple shadow-purple' 
                  : option.value === 'lead'
                    ? 'bg-action-purple text-white border-action-purple shadow-purple'
                    : option.value === 'customer'
                      ? 'bg-action-green text-white border-action-green shadow-green'
                      : 'bg-action-coral text-white border-action-coral shadow-coral'
                : option.color
              }
              hover:shadow-md hover:-translate-y-0.5
            `}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.label.split(' ')[0]}</span>
            {count > 0 && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/50 text-text-primary'
                }
              `}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
} 