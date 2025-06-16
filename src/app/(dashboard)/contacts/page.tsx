'use client'

import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { useContactStore } from '@/stores/contactStore'
import { useContactsRealtime } from '@/hooks/useContactsRealtime'
import { ContactCard } from '@/components/contacts/ContactCard'
import { SearchBar } from '@/components/contacts/SearchBar'
import { StatusFilter } from '@/components/contacts/StatusFilter'
import { AddContactModal } from '@/components/contacts/AddContactModal'
import { ContactDetailModal } from '@/components/contacts/ContactDetailModal'
import { ViewToggle, type ViewType } from '@/components/contacts/ViewToggle'
import { AdvancedFilters, type FilterOptions } from '@/components/contacts/AdvancedFilters'
import { ContactTable } from '@/components/contacts/ContactTable'
import { ErrorBoundary, QueryErrorFallback } from '@/components/ErrorBoundary'
import { Users, UserPlus, Target, Star, Filter, Heart } from 'lucide-react'
import type { Contact } from '@/types'

// React Query hooks
import { useContacts } from '@/hooks/queries/useContacts'

export default function ContactsPage() {
  const { user, loading } = useAuth()
  const { 
    searchQuery,
    statusFilter,
    selectedContact,
    selectContact,
    searchContacts,
    filterByStatus,
  } = useContactStore()

  // React Query for server state
  const { 
    data: contacts = [], 
    isLoading: contactsLoading, 
    error: contactsError,
    refetch: refetchContacts
  } = useContacts({
    searchQuery: searchQuery || undefined,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [view, setView] = useState<ViewType>('grid')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({})
  const [hasActiveFilters, setHasActiveFilters] = useState(false)

  // Set up realtime subscriptions
  useContactsRealtime()

  const handleContactClick = (contact: Contact) => {
    selectContact(contact)
    setShowDetailModal(true)
  }

  const handleApplyAdvancedFilters = (filters: FilterOptions) => {
    setAdvancedFilters(filters)
    setHasActiveFilters(Object.keys(filters).length > 0)
    setShowAdvancedFilters(false)
  }

  const handleClearFilters = () => {
    setAdvancedFilters({})
    setHasActiveFilters(false)
  }

  const handleContactAdded = () => {
    setShowAddModal(false)
    // React Query will automatically refetch due to invalidation
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-action-purple to-action-coral rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium text-text-secondary">Loading your contacts...</p>
        </div>
      </div>
    )
  }

  // Error handling
  if (contactsError) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
                Your Network
              </h1>
              <p className="text-lg text-text-secondary">
                Build and nurture your growing community
              </p>
            </div>
          </div>
          
          <QueryErrorFallback 
            error={contactsError as Error} 
            resetError={() => refetchContacts()} 
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-action-purple to-action-coral rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
                Your Network
              </h1>
              <p className="text-lg text-text-secondary">
                Build and nurture your growing community
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-action-purple text-white font-semibold rounded-xl shadow-purple hover:shadow-purple-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <UserPlus className="w-5 h-5" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-light">Total Contacts</p>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {contacts.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-action-purple/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-action-purple" />
              </div>
            </div>
          </div>

          <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-light">Leads</p>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {contacts.filter((c: Contact) => c.status === 'lead').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-action-golden/10 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-action-golden" />
              </div>
            </div>
          </div>

          <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-light">Customers</p>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {contacts.filter((c: Contact) => c.status === 'customer').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-action-green/10 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-action-green" />
              </div>
            </div>
          </div>

          <div className="bg-glass backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-light">Team Members</p>
                <p className="text-2xl font-display font-bold text-text-primary">
                  {contacts.filter((c: Contact) => c.status === 'team_member').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-action-coral/10 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-action-coral" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <SearchBar />
          </div>
          
          <div className="flex items-center gap-4">
            <StatusFilter />
            
            <button
              onClick={() => setShowAdvancedFilters(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
                hasActiveFilters 
                  ? 'bg-action-purple text-white border-action-purple shadow-purple' 
                  : 'bg-glass border-white/20 text-text-secondary hover:border-action-purple/50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-action-red hover:text-action-red/80 transition-colors duration-200"
              >
                Clear All
              </button>
            )}

            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>

        {/* Loading State */}
        {contactsLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gradient-to-r from-action-purple to-action-coral rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-text-secondary">Loading contacts...</p>
          </div>
        )}

        {/* Contact List */}
        {!contactsLoading && (
          <ErrorBoundary fallback={QueryErrorFallback}>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map((contact: Contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onClick={() => handleContactClick(contact)}
                  />
                ))}
              </div>
            ) : (
              <ContactTable 
                contacts={contacts}
                onContactClick={handleContactClick}
              />
            )}

            {/* Empty State */}
            {contacts.length === 0 && !contactsLoading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-action-purple to-action-coral rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-text-primary mb-3">
                  {searchQuery || statusFilter !== 'all' ? 'No contacts found' : 'Start building your network!'}
                </h3>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Add your first contact to begin growing your network and building meaningful relationships.'
                  }
                </p>
                {(!searchQuery && statusFilter === 'all') && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-action-purple text-white font-semibold rounded-xl shadow-purple hover:shadow-purple-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <UserPlus className="w-5 h-5" />
                    Add Your First Contact
                  </button>
                )}
              </div>
            )}
          </ErrorBoundary>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddContactModal
            onClose={() => setShowAddModal(false)}
            onSuccess={handleContactAdded}
          />
        )}

        {showDetailModal && selectedContact && (
          <ContactDetailModal
            contact={selectedContact}
            onClose={() => {
              setShowDetailModal(false)
              selectContact(null)
            }}
          />
        )}

        {showAdvancedFilters && (
          <AdvancedFilters
            isOpen={showAdvancedFilters}
            onClose={() => setShowAdvancedFilters(false)}
            onApplyFilters={handleApplyAdvancedFilters}
            currentFilters={advancedFilters}
          />
        )}
      </div>
    </DashboardLayout>
  )
} 