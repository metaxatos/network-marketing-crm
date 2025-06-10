'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { useAuth } from '@/hooks/useAuth';
import { Event, EventView, EventListFilter, EventStats } from '@/types/events';
import { getEvents, getEventStats, createEvent, registerForEvent, cancelEventRegistration } from '@/actions/events';
import EventsHeader from '@/components/events/EventsHeader';
import EventsCalendarView from '@/components/events/EventsCalendarView';
import EventsListView from '@/components/events/EventsListView';
import CreateEventModal from '@/components/events/CreateEventModal';

export default function EventsPage() {
  const { user } = useAuth();
  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View state
  const [view, setView] = useState<EventView>('list');
  const [filter, setFilter] = useState<EventListFilter>('upcoming');
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter events when filter changes
  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, statsData] = await Promise.all([
        getEvents(),
        getEventStats()
      ]);
      setEvents(eventsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events. Please try again.');
    }
  };

  const handleCreateEvent = async (eventData: Event) => {
    setEvents(prev => [eventData, ...prev]);
    setShowCreateModal(false);
    
    // Show success message
    console.log('Event created successfully!', eventData);
  };

  const handleEventView = (event: Event) => {
    setSelectedEvent(event);
    console.log('Viewing event:', event);
  };

  const handleEventEdit = (event: Event) => {
    console.log('Editing event:', event);
  };

  const handleEventInvite = (event: Event) => {
    console.log('Inviting to event:', event);
  };

  const handleEventRegister = async (event: Event) => {
    try {
      if (event.user_registration) {
        // Cancel registration
        await cancelEventRegistration(event.id);
        setEvents(prev => prev.map(e => 
          e.id === event.id 
            ? { ...e, user_registration: undefined, registration_count: Math.max(0, (e.registration_count || 0) - 1) }
            : e
        ));
        console.log('Registration cancelled');
      } else {
        // Register for event
        const registration = await registerForEvent(event.id);
        setEvents(prev => prev.map(e => 
          e.id === event.id 
            ? { ...e, user_registration: registration, registration_count: (e.registration_count || 0) + 1 }
            : e
        ));
        console.log('Successfully registered for event');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Failed to update registration. Please try again.');
    }
  };

  const handleCalendarSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    setShowCreateModal(true);
    console.log('Creating event for slot:', slotInfo);
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

  if (loading) {
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

  if (error) {
    return (
      <DashboardLayout user={user || undefined}>
        <div className="min-h-screen gradient-main flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 
                     transition-all duration-200 font-medium shadow-lg hover:shadow-xl 
                     hover:scale-105 active:scale-95"
          >
            Try Again
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

      {/* Mobile Bottom Navigation Space */}
      <div className="h-20 md:hidden"></div>
      </div>
    </DashboardLayout>
  );
} 