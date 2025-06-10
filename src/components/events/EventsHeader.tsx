'use client';

import { useState, useEffect } from 'react';
import { EventStats, EventView, EventListFilter } from '@/types/events';
import { getEventStats } from '@/actions/events';

interface EventsHeaderProps {
  onCreateEvent: () => void;
  view: EventView;
  onViewChange: (view: EventView) => void;
  filter: EventListFilter;
  onFilterChange: (filter: EventListFilter) => void;
}

export default function EventsHeader({
  onCreateEvent,
  view,
  onViewChange,
  filter,
  onFilterChange
}: EventsHeaderProps) {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const eventStats = await getEventStats();
        setStats(eventStats);
      } catch (error) {
        console.error('Failed to load event stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const filterOptions = [
    { value: 'all', label: 'All Events', icon: '📋', count: stats?.total_events || 0 },
    { value: 'upcoming', label: 'Upcoming', icon: '🚀', count: stats?.upcoming_events || 0 },
    { value: 'mine', label: 'My Events', icon: '👤', count: 0 },
    { value: 'attending', label: 'Attending', icon: '🎟️', count: 0 },
    { value: 'past', label: 'Past', icon: '📚', count: 0 }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden">
        {/* Main Header */}
        <div className="bg-white sticky top-0 z-40 shadow-sm border-b border-slate-200">
          <div className="px-4 py-4">
            {/* Title Row */}
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-xl font-bold text-slate-900 font-['Poppins']">
                📅 Events
              </h1>
              <button
                onClick={onCreateEvent}
                className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center
                         shadow-lg hover:bg-purple-600 active:scale-95 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* Event Type Filters - Horizontal Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value as EventListFilter)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap border-2 transition-all duration-200 ${
                    filter === option.value
                      ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                      : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      filter === option.value
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8">
          {/* Main Header */}
          <div className="py-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center font-['Poppins']">
                  📅 Events
                </h1>
                <p className="mt-2 text-slate-600 text-lg">
                  Create and manage your team events, meetings, and presentations
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={onCreateEvent}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 
                           text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 
                           transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl
                           active:scale-95"
                >
                  <span className="mr-2 text-lg">✨</span>
                  Create Event
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="py-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="h-4 bg-gray-200 rounded mb-3 animate-shimmer"></div>
                    <div className="h-8 bg-gray-200 rounded animate-shimmer"></div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-xl text-lg">
                        📊
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-700">Total Events</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.total_events}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-xl text-lg">
                        🚀
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-700">Upcoming</p>
                      <p className="text-2xl font-bold text-green-900">{stats.upcoming_events}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-500 text-white rounded-xl text-lg">
                        📈
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-700">This Month</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.events_this_month}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-xl text-lg">
                        👥
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-700">Total Attendees</p>
                      <p className="text-2xl font-bold text-orange-900">{stats.total_attendees}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-teal-500 text-white rounded-xl text-lg">
                        📊
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-teal-700">Attendance Rate</p>
                      <p className="text-2xl font-bold text-teal-900">{Math.round(stats.attendance_rate)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Controls */}
          <div className="pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* View Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => onViewChange('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    view === 'list'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => onViewChange('calendar')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    view === 'calendar'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📅 Calendar
                </button>
              </div>

              {/* Filter Options */}
              <div className="flex space-x-2">
                <select
                  value={filter}
                  onChange={(e) => onFilterChange(e.target.value as EventListFilter)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 
                           focus:border-transparent bg-white hover:border-slate-400 transition-colors"
                >
                  <option value="all">All Events</option>
                  <option value="mine">My Events</option>
                  <option value="attending">Attending</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past Events</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 