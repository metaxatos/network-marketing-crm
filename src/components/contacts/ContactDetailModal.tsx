'use client'

import { useState, useEffect } from 'react'
import { 
  useUpdateContact, 
  useDeleteContact, 
  useContactNotes, 
  useAddContactNote 
} from '@/hooks/queries/useContacts'
import type { Contact, ContactNote } from '@/types'
import { Target, Star, Users, User, Mail, Phone, X, Edit3, Trash2, MessageCircle, Calendar, Tag } from 'lucide-react'

interface ContactDetailModalProps {
  contact: Contact
  onClose: () => void
}

export function ContactDetailModal({ contact, onClose }: ContactDetailModalProps) {
  // React Query hooks
  const { mutate: updateContact, isPending: isUpdating } = useUpdateContact()
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact()
  const { data: notes = [], isLoading: notesLoading } = useContactNotes(contact.id)
  const { mutate: addNote, isPending: isAddingNote } = useAddContactNote()
  
  const [isEditing, setIsEditing] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [editedContact, setEditedContact] = useState(contact)

  useEffect(() => {
    setEditedContact(contact)
  }, [contact])

  const handleSave = async () => {
    updateContact(
      { id: contact.id, updates: editedContact },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
        onError: (error) => {
          console.error('Failed to update contact:', error)
        }
      }
    )
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    
    addNote(
      { contactId: contact.id, content: newNote },
      {
        onSuccess: () => {
          setNewNote('')
        },
        onError: (error) => {
          console.error('Failed to add note:', error)
        }
      }
    )
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this contact?')) {
      deleteContact(contact.id, {
        onSuccess: () => {
          onClose()
        },
        onError: (error) => {
          console.error('Failed to delete contact:', error)
        }
      })
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'lead': 
        return { 
          color: 'text-action-purple bg-action-purple/10 border-action-purple/20', 
          icon: <Target className="w-4 h-4" />,
          label: 'Lead'
        }
      case 'customer': 
        return { 
          color: 'text-action-green bg-action-green/10 border-action-green/20', 
          icon: <Star className="w-4 h-4" />,
          label: 'Customer'
        }
      case 'team_member': 
        return { 
          color: 'text-action-coral bg-action-coral/10 border-action-coral/20', 
          icon: <Users className="w-4 h-4" />,
          label: 'Team Member'
        }
      default: 
        return { 
          color: 'text-text-secondary bg-gray-50 border-gray-200', 
          icon: <User className="w-4 h-4" />,
          label: 'Contact'
        }
    }
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
  const isLoading = isUpdating || isDeleting || isAddingNote

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-action-purple to-action-coral rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                {contact.name}
              </h2>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                {statusInfo.icon} 
                {statusInfo.label}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-10 h-10 rounded-full bg-action-blue/10 text-action-blue hover:bg-action-blue hover:text-white transition-colors duration-200 flex items-center justify-center"
              disabled={isLoading}
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="w-10 h-10 rounded-full bg-action-coral/10 text-action-coral hover:bg-action-coral hover:text-white transition-colors duration-200 flex items-center justify-center"
              disabled={isLoading}
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-text-secondary hover:text-text-primary transition-colors duration-200 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-action-purple" />
              Contact Information
            </h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                    value={editedContact.name}
                    onChange={(e) => setEditedContact(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                    value={editedContact.email || ''}
                    onChange={(e) => setEditedContact(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                    value={editedContact.phone || ''}
                    onChange={(e) => setEditedContact(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 px-4 bg-white/50 border-2 border-white/20 text-text-secondary font-semibold rounded-xl hover:bg-white/70 transition-all duration-300"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 px-4 bg-action-purple text-white font-semibold rounded-xl shadow-purple hover:shadow-purple-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-action-teal" />
                  <span className="text-text-primary">{contact.email || 'No email'}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-action-golden" />
                  <span className="text-text-primary">{contact.phone || 'No phone'}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-action-blue" />
                  <span className="text-text-primary">Added {timeAgo(contact.created_at)}</span>
                </div>
                
                {contact.last_contacted_at && (
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-action-coral" />
                    <span className="text-text-primary">Last contacted {timeAgo(contact.last_contacted_at)}</span>
                  </div>
                )}
                
                {contact.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-action-purple mt-0.5" />
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-action-purple/10 text-action-purple text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-action-coral" />
              Notes & Interactions
            </h3>
            
            {/* Add Note */}
            <div className="space-y-3 mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this contact..."
                rows={3}
                className="w-full px-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isAddingNote}
                className="px-6 py-2 bg-action-coral text-white font-semibold rounded-xl shadow-coral hover:shadow-coral-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
            
            {/* Notes List */}
            {notesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-white/20 rounded-xl animate-pulse">
                    <div className="h-4 bg-white/30 rounded mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 bg-white/20 rounded-xl border border-white/10">
                    <p className="text-text-primary mb-2">{note.content}</p>
                    <p className="text-text-light text-sm">{timeAgo(note.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notes yet. Add the first note about this contact!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 