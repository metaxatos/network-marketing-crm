'use client'

import type { Contact } from '@/types'
import { Mail, Phone, ChevronRight, Target, Star, User, Users, MoreVertical } from 'lucide-react'

interface ContactTableProps {
  contacts: Contact[]
  onContactClick: (contact: Contact) => void
}

export function ContactTable({ contacts, onContactClick }: ContactTableProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'lead': 
        return { 
          color: 'bg-action-purple/10 text-action-purple border-action-purple/20', 
          icon: <Target className="w-3 h-3" />,
          label: 'Lead'
        }
      case 'customer': 
        return { 
          color: 'bg-action-green/10 text-action-green border-action-green/20', 
          icon: <Star className="w-3 h-3" />,
          label: 'Customer'
        }
      case 'team_member': 
        return { 
          color: 'bg-action-coral/10 text-action-coral border-action-coral/20', 
          icon: <Users className="w-3 h-3" />,
          label: 'Team Member'
        }
      default: 
        return { 
          color: 'bg-gray-100 text-gray-600 border-gray-200', 
          icon: <User className="w-3 h-3" />,
          label: 'Contact'
        }
    }
  }

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/30 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Added
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Last Contact
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {contacts.map((contact) => {
              const statusInfo = getStatusInfo(contact.status)
              
              return (
                <tr 
                  key={contact.id}
                  onClick={() => onContactClick(contact)}
                  className="hover:bg-white/10 cursor-pointer transition-all duration-200 group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-action-purple to-action-coral rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4 shadow-sm">
                        {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-text-primary">
                          {contact.name}
                        </div>
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {contact.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-action-golden/10 text-action-golden border border-action-golden/20"
                              >
                                {tag}
                              </span>
                            ))}
                            {contact.tags.length > 2 && (
                              <span className="text-xs text-text-light">
                                +{contact.tags.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Mail className="w-4 h-4 text-action-teal" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Phone className="w-4 h-4 text-action-blue" />
                          {contact.phone}
                        </div>
                      )}
                      {!contact.email && !contact.phone && (
                        <span className="text-sm text-text-light italic">No contact info</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-5 text-sm text-text-secondary">
                    {timeAgo(contact.created_at)}
                  </td>
                  
                  <td className="px-6 py-5 text-sm text-text-secondary">
                    {contact.last_contacted_at ? timeAgo(contact.last_contacted_at) : (
                      <span className="text-text-light italic">Never</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {contact.email && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`mailto:${contact.email}`)
                          }}
                          className="w-8 h-8 rounded-full bg-action-teal/10 text-action-teal hover:bg-action-teal hover:text-white transition-colors duration-200 flex items-center justify-center"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      {contact.phone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`tel:${contact.phone}`)
                          }}
                          className="w-8 h-8 rounded-full bg-action-blue/10 text-action-blue hover:bg-action-blue hover:text-white transition-colors duration-200 flex items-center justify-center"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronRight className="w-5 h-5 text-text-light" />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {contacts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-text-light text-lg">No contacts found</div>
        </div>
      )}
    </div>
  )
} 