'use client';

import { useState, useMemo } from 'react';
import { Event, EventListFilter } from '@/types/events';
import EventCard from './EventCard';
import { format, isToday, isPast, isFuture, startOfDay, endOfDay } from 'date-fns';

interface EventsListViewProps {
  events: Event[];
  filter: EventListFilter;
  onEventView: (event: Event) => void;
  onEventEdit: (event: Event) => void;
  onEventInvite: (event: Event) => void;
  onEventRegister?: (event: Event) => void;
}

export default function EventsListView({
  events,
  filter,
  onEventView,
  onEventEdit,
  onEventInvite,
  onEventRegister
}: EventsListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    const now = new Date();

    // Apply main filter
    switch (filter) {
      case 'mine':
        filtered = filtered.filter(event => event.is_creator);
        break;
      case 'attending':
        filtered = filtered.filter(event => 
          event.is_creator || event.user_registration?.status === 'registered'
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(event => isFuture(new Date(event.start_time)));
        break;
      case 'past':
        filtered = filtered.filter(event => isPast(new Date(event.end_time)));
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.tags.some(tag => tag.toLowerCase().includes(query)) ||
        event.location_name?.toLowerCase().includes(query)
      );
    }

    // Sort events: live events first, then by start time
    return filtered.sort((a, b) => {
      const now = new Date();
      const aStart = new Date(a.start_time);
      const aEnd = new Date(a.end_time);
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);

      // Check if events are happening now
      const aIsLive = now >= aStart && now <= aEnd;
      const bIsLive = now >= bStart && now <= bEnd;

      if (aIsLive && !bIsLive) return -1;
      if (!aIsLive && bIsLive) return 1;

      // Then sort by start time
      return aStart.getTime() - bStart.getTime();
    });
  }, [events, filter, searchQuery]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: Event[] } = {};
    
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.start_time);
      let groupKey: string;
      
      if (isToday(eventDate)) {
        groupKey = 'Today';
      } else if (isPast(eventDate)) {
        groupKey = format(eventDate, 'MMMM yyyy');
      } else {
        groupKey = format(eventDate, 'MMMM d, yyyy');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(event);
    });

    return groups;
  }, [filteredEvents]);

  const getEmptyStateMessage = () => {
    if (searchQuery.trim()) {
      return {
        title: 'No matching events found',
        description: `No events match your search for "${searchQuery}". Try adjusting your search terms.`,
        icon: '🔍',
        illustration: 'bg-gradient-to-br from-blue-400 to-purple-500'
      };
    }

    switch (filter) {
      case 'mine':
        return {
          title: 'You haven\'t created any events yet',
          description: 'Start building your network by creating your first event!',
          icon: '📅',
          illustration: 'bg-gradient-to-br from-purple-400 to-pink-500'
        };
      case 'attending':
        return {
          title: 'No events you\'re attending',
          description: 'Look for upcoming events from your team to join.',
          icon: '🎟️',
          illustration: 'bg-gradient-to-br from-green-400 to-teal-500'
        };
      case 'upcoming':
        return {
          title: 'No upcoming events',
          description: 'All your events are in the past. Time to plan something new!',
          icon: '🚀',
          illustration: 'bg-gradient-to-br from-orange-400 to-red-500'
        };
      case 'past':
        return {
          title: 'No past events',
          description: 'Your event history will appear here after you create and host events.',
          icon: '📚',
          illustration: 'bg-gradient-to-br from-indigo-400 to-blue-500'
        };
      default:
        return {
          title: 'No events found',
          description: 'Get started by creating your first team event!',
          icon: '✨',
          illustration: 'bg-gradient-to-br from-purple-400 to-indigo-500'
        };
    }
  };

  if (filteredEvents.length === 0) {
    const emptyState = getEmptyStateMessage();
    
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* Beautiful Illustration */}
        <div className="relative mb-6">
          <div className={`w-48 h-48 md:w-64 md:h-64 ${emptyState.illustration} rounded-full flex items-center justify-center relative overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
            <div className="absolute inset-4 border-2 border-white/20 rounded-full"></div>
            <div className="absolute inset-8 border border-white/10 rounded-full"></div>
            
            {/* Main icon */}
            <div className="text-6xl md:text-8xl text-white z-10">
              {emptyState.icon}
            </div>
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 font-['Poppins']">
          {emptyState.title}
        </h3>
        <p className="text-slate-600 max-w-md mx-auto mb-8 text-base md:text-lg leading-relaxed">
          {emptyState.description}
        </p>
        
        {filter !== 'past' && !searchQuery.trim() && (
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 
                           text-white rounded-full hover:from-purple-600 hover:to-indigo-700 
                           transition-all duration-200 font-medium shadow-lg hover:shadow-xl 
                           hover:scale-105 active:scale-95">
            <span className="mr-2 text-lg">✨</span>
            Create Your First Event
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar - Mobile */}
      <div className="md:hidden">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-full focus:ring-2 
                     focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm
                     placeholder-slate-400 text-slate-900 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar - Desktop */}
      <div className="hidden md:block">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 
                     focus:ring-purple-500 focus:border-transparent bg-white
                     placeholder-slate-400 text-slate-900 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {filteredEvents.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-slate-600 font-medium">
            {filteredEvents.length === 1 
              ? '1 event found' 
              : `${filteredEvents.length} events found`}
          </p>
          
          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Quick filters:</span>
            <button
              onClick={() => setSearchQuery('today')}
              className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 
                       transition-colors font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setSearchQuery('online')}
              className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 
                       transition-colors font-medium"
            >
              Online
            </button>
            <button
              onClick={() => setSearchQuery('team')}
              className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 
                       transition-colors font-medium"
            >
              Team
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([dateGroup, groupEvents]) => (
          <div key={dateGroup}>
            {/* Date Group Header */}
            <div className="sticky top-16 md:top-0 z-10 bg-gradient-to-r from-white/90 to-white/80 
                          backdrop-blur-sm -mx-4 px-4 py-3 border-b border-slate-200 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center font-['Poppins']">
                {dateGroup === 'Today' && <span className="mr-2">📅</span>}
                {dateGroup}
                <span className="ml-3 text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {groupEvents.length} {groupEvents.length === 1 ? 'event' : 'events'}
                </span>
              </h3>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groupEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={onEventView}
                  onEdit={onEventEdit}
                  onInvite={onEventInvite}
                  onJoin={onEventRegister}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load More (placeholder for pagination) */}
      {filteredEvents.length > 0 && (
        <div className="text-center py-8">
          <button className="px-8 py-3 text-slate-600 hover:text-slate-900 hover:bg-white/80 
                           rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200
                           hover:border-slate-300 font-medium">
            Load More Events
          </button>
        </div>
      )}
    </div>
  );
} 