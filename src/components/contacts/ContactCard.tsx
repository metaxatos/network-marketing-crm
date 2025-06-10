'use client'

import type { Contact } from '@/types'
import { Mail, Phone, ChevronRight, Target, Star, Users, User, MessageCircle, Calendar } from 'lucide-react'

interface ContactCardProps {
  contact: Contact
  onClick: () => void
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'lead': 
        return { 
          color: 'text-action-purple border-action-purple/20 bg-action-purple/10', 
          icon: <Target className="w-3 h-3" />,
          label: 'Lead'
        }
      case 'customer': 
        return { 
          color: 'text-action-green border-action-green/20 bg-action-green/10', 
          icon: <Star className="w-3 h-3" />,
          label: 'Customer'
        }
      case 'team_member': 
        return { 
          color: 'text-action-coral border-action-coral/20 bg-action-coral/10', 
          icon: <Users className="w-3 h-3" />,
          label: 'Team Member'
        }
      default: 
        return { 
          color: 'text-text-secondary border-gray-200 bg-gray-50', 
          icon: <User className="w-3 h-3" />,
          label: 'Contact'
        }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const created = new Date(date)
    const diffMs = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const statusInfo = getStatusInfo(contact.status)

  return (
    <div 
      className="bg-glass backdrop-blur-md rounded-xl border border-white/20 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Avatar with gradient background */}
        <div className="flex-shrink-0 relative">
          <div className="w-16 h-16 bg-gradient-to-br from-action-purple to-action-coral rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {getInitials(contact.name)}
          </div>
          {/* Status indicator dot */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${statusInfo.color.includes('purple') ? 'bg-action-purple' : statusInfo.color.includes('green') ? 'bg-action-green' : statusInfo.color.includes('coral') ? 'bg-action-coral' : 'bg-gray-400'} border-2 border-white shadow-sm`}></div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-display font-semibold text-text-primary truncate">
                {contact.name}
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color} mt-1`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
            
            {/* Quick Actions (visible on hover/desktop) */}
            <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {contact.email && (
                <button 
                  className="w-9 h-9 rounded-full bg-action-teal/10 text-action-teal hover:bg-action-teal hover:text-white transition-colors duration-200 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`mailto:${contact.email}`)
                  }}
                >
                  <Mail className="w-4 h-4" />
                </button>
              )}
              {contact.phone && (
                <button 
                  className="w-9 h-9 rounded-full bg-action-blue/10 text-action-blue hover:bg-action-blue hover:text-white transition-colors duration-200 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`tel:${contact.phone}`)
                  }}
                >
                  <Phone className="w-4 h-4" />
                </button>
              )}
              <button className="w-9 h-9 rounded-full bg-action-golden/10 text-action-golden hover:bg-action-golden hover:text-white transition-colors duration-200 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            {contact.email && (
              <div className="flex items-center text-sm text-text-secondary">
                <Mail className="w-4 h-4 mr-3 text-action-teal" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center text-sm text-text-secondary">
                <Phone className="w-4 h-4 mr-3 text-action-blue" />
                <span>{contact.phone}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {contact.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/50 text-text-primary border border-white/20"
                >
                  {tag}
                </span>
              ))}
              {contact.tags.length > 3 && (
                <span className="text-xs text-text-light py-1 px-2">
                  +{contact.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-text-light">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Added {timeAgo(contact.created_at)}
              </span>
              {contact.last_contacted_at && (
                <span className="hidden sm:flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Last contact: {timeAgo(contact.last_contacted_at)}
                </span>
              )}
            </div>
            
            {/* Expand Arrow */}
            <ChevronRight className="w-5 h-5 text-text-light group-hover:text-action-purple group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </div>
      </div>
    </div>
  )
} 