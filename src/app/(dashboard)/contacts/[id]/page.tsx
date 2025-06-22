'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { 
  useUpdateContact, 
  useDeleteContact, 
  useContactNotes, 
  useAddContactNote,
  useContact
} from '@/hooks/queries/useContacts'
import type { Contact } from '@/types'
import { 
  Target, 
  Star, 
  Users, 
  User, 
  Mail, 
  Phone, 
  Edit3, 
  Trash2, 
  MessageCircle, 
  Calendar, 
  Tag,
  ArrowLeft,
  Save,
  X
} from 'lucide-react'

// Local note type for inline storage (matches hook definition)
interface ContactNote {
  id: string
  content: string
  created_at: string
  created_by: string
}

export default function ContactDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const contactId = params.id as string

  // React Query hooks
  const { data: contact, isLoading: contactLoading, error: contactError } = useContact(contactId)
  const { mutate: updateContact, isPending: isUpdating } = useUpdateContact()
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact()
  const { data: notes = [], isLoading: notesLoading } = useContactNotes(contactId)
  const { mutate: addNote, isPending: isAddingNote } = useAddContactNote()

  const [isEditing, setIsEditing] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [editedContact, setEditedContact] = useState<Contact | null>(null)

  useEffect(() => {
    if (contact) {
      setEditedContact(contact)
    }
  }, [contact])

  const handleSave = async () => {
    if (!editedContact) return

    updateContact(
      { id: contactId, updates: editedContact },
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
      { contactId, content: newNote },
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
    if (confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      deleteContact(contactId, {
        onSuccess: () => {
          router.push('/contacts')
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

  if (loading || contactLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (contactError || !contact) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-display font-semibold text-text-primary mb-4">
              Contact Not Found
            </h2>
            <p className="text-text-secondary mb-8">
              The contact you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={() => router.push('/contacts')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-action-purple text-white font-semibold rounded-xl shadow-purple hover:shadow-purple-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Contacts
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const statusInfo = getStatusInfo(contact.status)
  const isLoading = isUpdating || isDeleting || isAddingNote

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/contacts')}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Contacts
        </button>

        {/* Header */}
        <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-action-purple to-action-coral rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-text-primary mb-3">
                  {contact.name}
                </h1>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                  {statusInfo.icon} 
                  {statusInfo.label}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-action-blue/10 text-action-blue hover:bg-action-blue hover:text-white rounded-xl transition-colors duration-200"
                disabled={isLoading}
              >
                <Edit3 className="w-5 h-5" />
                {isEditing ? 'Cancel Edit' : 'Edit Contact'}
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-action-coral/10 text-action-coral hover:bg-action-coral hover:text-white rounded-xl transition-colors duration-200"
                disabled={isLoading}
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-display font-semibold text-text-primary mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-action-purple" />
              Contact Information
            </h2>
            
            {isEditing && editedContact ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                    value={editedContact.name}
                    onChange={(e) => setEditedContact(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                    value={editedContact.email || ''}
                    onChange={(e) => setEditedContact(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                    value={editedContact.phone || ''}
                    onChange={(e) => setEditedContact(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300"
                    value={editedContact.status}
                    onChange={(e) => setEditedContact(prev => prev ? { ...prev, status: e.target.value as 'lead' | 'customer' | 'team_member' } : null)}
                  >
                    <option value="lead">Lead</option>
                    <option value="customer">Customer</option>
                    <option value="team_member">Team Member</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 px-4 bg-white/50 border-2 border-white/20 text-text-secondary font-semibold rounded-xl hover:bg-white/70 transition-all duration-300"
                    disabled={isLoading}
                  >
                    <X className="w-5 h-5 inline mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 px-4 bg-action-purple text-white font-semibold rounded-xl shadow-purple hover:shadow-purple-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/30 rounded-xl">
                  <Mail className="w-6 h-6 text-action-teal" />
                  <div>
                    <p className="text-sm font-medium text-text-light">Email</p>
                    <p className="text-text-primary font-medium">{contact.email || 'No email provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/30 rounded-xl">
                  <Phone className="w-6 h-6 text-action-golden" />
                  <div>
                    <p className="text-sm font-medium text-text-light">Phone</p>
                    <p className="text-text-primary font-medium">{contact.phone || 'No phone provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/30 rounded-xl">
                  <Calendar className="w-6 h-6 text-action-blue" />
                  <div>
                    <p className="text-sm font-medium text-text-light">Added</p>
                    <p className="text-text-primary font-medium">{timeAgo(contact.created_at)}</p>
                  </div>
                </div>
                
                {contact.last_contacted_at && (
                  <div className="flex items-center gap-4 p-4 bg-white/30 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-action-coral" />
                    <div>
                      <p className="text-sm font-medium text-text-light">Last Contact</p>
                      <p className="text-text-primary font-medium">{timeAgo(contact.last_contacted_at)}</p>
                    </div>
                  </div>
                )}
                
                {contact.tags && contact.tags.length > 0 && (
                  <div className="p-4 bg-white/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-action-purple" />
                      <p className="text-sm font-medium text-text-light">Tags</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-action-purple/10 text-action-purple text-sm rounded-full border border-action-purple/20">
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
          <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-display font-semibold text-text-primary mb-6 flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-action-coral" />
              Notes & Interactions
            </h2>
            
            {/* Add Note */}
            <div className="space-y-4 mb-8">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this contact..."
                rows={4}
                className="w-full px-4 py-3 bg-white/50 border-2 border-white/20 rounded-xl text-base placeholder-text-light text-text-primary focus:border-action-purple focus:ring-2 focus:ring-action-purple/20 transition-all duration-300 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isAddingNote}
                className="inline-flex items-center gap-2 px-6 py-3 bg-action-coral text-white font-semibold rounded-xl shadow-coral hover:shadow-coral-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                <MessageCircle className="w-5 h-5" />
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
            
            {/* Notes List */}
            {notesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-white/20 rounded-xl animate-pulse">
                    <div className="h-4 bg-white/30 rounded mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 bg-white/20 rounded-xl border border-white/10">
                    <p className="text-text-primary mb-3 leading-relaxed">{note.content}</p>
                    <p className="text-text-light text-sm">{timeAgo(note.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-secondary">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                <p>Add the first note about this contact to track your interactions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 