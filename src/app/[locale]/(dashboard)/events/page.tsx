'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { useAuth } from '@/hooks/useAuth';
import { Event, EventView, EventListFilter } from '@/types/events';
import { useEvents, useCreateEvent, useRegisterForEvent, useCancelEventRegistration } from '@/hooks/queries/useEvents';
import EventsHeader from '@/components/events/EventsHeader';
import EventsCalendarView from '@/components/events/EventsCalendarView';
import EventsListView from '@/components/events/EventsListView';
import CreateEventModal from '@/components/events/CreateEventModal';
import EventDetailsModal from '@/components/events/EventDetailsModal';
import EventInviteModal from '@/components/events/EventInviteModal';

export default function EventsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // View state
  const [view, setView] = useState<EventView>('list');
  const [filter, setFilter] = useState<EventListFilter>('upcoming');
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Hooks for data fetching
  const { data: events = [], isLoading, error, refetch } = useEvents();
  const createEventMutation = useCreateEvent();
  const registerMutation = useRegisterForEvent();
  const cancelRegistrationMutation = useCancelEventRegistration();

  const handleCreateEvent = async (eventData: any) => {
    try {
      await createEventMutation.mutateAsync(eventData);
      setShowCreateModal(false);
      console.log('Event created successfully!', eventData);
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleEventView = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
    console.log('Viewing event:', event);
  };

  const handleEventEdit = (event: Event) => {
    setSelectedEvent(event);
    // TODO: Implement edit modal or redirect to edit page
    console.log('Editing event:', event);
  };

  const handleEventInvite = (event: Event) => {
    setSelectedEvent(event);
    setShowInviteModal(true);
    console.log('Inviting to event:', event);
  };

  const handleEventRegister = async (event: Event) => {
    try {
      if (event.user_registration) {
        // Cancel registration
        await cancelRegistrationMutation.mutateAsync(event.id);
        console.log('Registration cancelled');
      } else {
        // Register for event
        await registerMutation.mutateAsync(event.id);
        console.log('Successfully registered for event');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleCalendarSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    setShowCreateModal(true);
    console.log('Creating event for slot:', slotInfo);
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    setSelectedEvent(null);
    // Optionally show success message
    console.log('Invitations sent successfully!');
  };

  // Filter events based on current filter
  const filteredEvents = events.filter(event => {
    const now = new Date();
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    switch (filter) {
      case 'mine':
        return event.is_creator;
      case 'attending':
        return event.is_creator || event.user_registration?.status === 'registered';
      case 'upcoming':
        return eventStart > now;
      case 'past':
        return eventEnd < now;
      default:
        return true;
    }
  });

  if (authLoading || isLoading) {
    return (
      <DashboardLayout user={user || undefined}>
        <div className="min-h-screen gradient-main">
        {/* Header Skeleton */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-4 animate-shimmer"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl animate-shimmer"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 rounded-xl mb-6 animate-shimmer"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-shimmer"></div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !authLoading) {
    return (
      <DashboardLayout user={user || undefined}>
        <div className="min-h-screen gradient-main flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {!isAuthenticated ? 'Please log in' : 'Something went wrong'}
          </h3>
          <p className="text-slate-600 mb-6">
            {!isAuthenticated 
              ? 'You need to be logged in to view events.' 
              : (error as Error)?.message || 'Failed to load events'
            }
          </p>
          <button
            onClick={() => !isAuthenticated ? window.location.href = '/login' : refetch()}
            className="px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 
                     transition-all duration-200 font-medium shadow-lg hover:shadow-xl 
                     hover:scale-105 active:scale-95"
          >
            {!isAuthenticated ? 'Go to Login' : 'Try Again'}
          </button>
        </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user || undefined}>
      <div className="min-h-screen gradient-main">
      {/* Events Header */}
      <EventsHeader
        onCreateEvent={() => setShowCreateModal(true)}
        view={view}
        onViewChange={setView}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Main Content */}
      <div className={`${view === 'calendar' ? 'p-0' : 'px-4 py-6 md:px-8'} pb-20 md:pb-6`}>
        {view === 'calendar' ? (
          <div className="bg-white mx-4 md:mx-8 mt-6 rounded-2xl shadow-lg overflow-hidden">
            <EventsCalendarView
              events={filteredEvents}
              onEventClick={handleEventView}
              onSlotSelect={handleCalendarSlotSelect}
            />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <EventsListView
              events={filteredEvents}
              filter={filter}
              onEventView={handleEventView}
              onEventEdit={handleEventEdit}
              onEventInvite={handleEventInvite}
              onEventRegister={handleEventRegister}
            />
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateEvent}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEventEdit}
        onInvite={handleEventInvite}
      />

      {/* Event Invite Modal */}
      <EventInviteModal
        event={selectedEvent}
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedEvent(null);
        }}
        onSuccess={handleInviteSuccess}
      />

      {/* Mobile Bottom Navigation Space */}
      <div className="h-20 md:hidden"></div>
      </div>
    </DashboardLayout>
  );
} 