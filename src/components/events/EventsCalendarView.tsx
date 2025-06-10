'use client';

import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Event, CalendarEvent, EVENT_TYPE_CONFIG } from '@/types/events';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface EventsCalendarViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onSlotSelect?: (slotInfo: { start: Date; end: Date }) => void;
}

export default function EventsCalendarView({ 
  events, 
  onEventClick, 
  onSlotSelect 
}: EventsCalendarViewProps) {
  // Transform events for calendar
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      resource: event,
    }));
  }, [events]);

  // Custom event style based on event type and status
  const eventStyleGetter = (event: CalendarEvent) => {
    const eventData = event.resource;
    if (!eventData) return { style: {} };
    const eventConfig = EVENT_TYPE_CONFIG[eventData.event_type];
    const now = new Date();
    const isHappeningNow = now >= event.start && now <= event.end;
    const isToday = event.start.toDateString() === now.toDateString();

    let backgroundColor = '#3B82F6'; // Default blue
    let borderColor = '#2563EB';

    // Set colors based on event type
    switch (eventConfig.color) {
      case 'blue':
        backgroundColor = eventData.format === 'online' ? '#3B82F6' : '#1D4ED8';
        borderColor = '#1E40AF';
        break;
      case 'purple':
        backgroundColor = '#8B5CF6';
        borderColor = '#7C3AED';
        break;
      case 'green':
        backgroundColor = '#10B981';
        borderColor = '#059669';
        break;
      case 'orange':
        backgroundColor = '#F59E0B';
        borderColor = '#D97706';
        break;
      case 'brown':
        backgroundColor = '#92400E';
        borderColor = '#78350F';
        break;
      case 'gold':
        backgroundColor = '#F59E0B';
        borderColor = '#D97706';
        break;
      default:
        backgroundColor = '#6B7280';
        borderColor = '#4B5563';
    }

    // Special styling for live events
    if (isHappeningNow) {
      backgroundColor = '#EF4444';
      borderColor = '#DC2626';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '500',
        opacity: isHappeningNow ? 1 : 0.9,
        boxShadow: isToday ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
        animation: isHappeningNow ? 'pulse 2s infinite' : 'none',
      }
    };
  };

  // Custom event component for more detailed display
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const eventData = event.resource;
    if (!eventData) return <div className="text-xs">{event.title}</div>;
    
    const eventConfig = EVENT_TYPE_CONFIG[eventData.event_type];
    const now = new Date();
    const isHappeningNow = now >= event.start && now <= event.end;

    return (
      <div className="flex items-center space-x-1 text-xs">
        <span className="flex-shrink-0">{eventConfig.icon}</span>
        <span className="truncate font-medium">{event.title}</span>
        {isHappeningNow && <span className="flex-shrink-0 animate-pulse">🔴</span>}
        {eventData.format === 'online' && <span className="flex-shrink-0">💻</span>}
        {eventData.format === 'live' && <span className="flex-shrink-0">📍</span>}
      </div>
    );
  };

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<CalendarEvent, object>) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">{label}</h2>
          <div className="flex space-x-1">
            <button
              onClick={() => onNavigate('PREV')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => onNavigate('TODAY')}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => onNavigate('NEXT')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'day'] as View[]).map((viewName) => (
            <button
              key={viewName}
              onClick={() => onView(viewName)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                view === viewName
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {viewName}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <style jsx global>{`
          .rbc-calendar {
            font-family: inherit;
          }
          .rbc-event {
            padding: 2px 4px;
            border-radius: 4px;
            font-size: 12px;
          }
          .rbc-event-content {
            overflow: hidden;
          }
          .rbc-today {
            background-color: rgba(59, 130, 246, 0.1);
          }
          .rbc-off-range-bg {
            background-color: rgba(0, 0, 0, 0.05);
          }
          .rbc-month-view {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          .rbc-header {
            background-color: #f9fafb;
            padding: 12px 8px;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
          }
          .rbc-date-cell {
            padding: 8px;
            text-align: right;
          }
          .rbc-date-cell a {
            color: #374151;
            text-decoration: none;
          }
          .rbc-date-cell a:hover {
            color: #3b82f6;
          }
          .rbc-slot-selection {
            background-color: rgba(59, 130, 246, 0.2);
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}</style>

        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
            toolbar: CustomToolbar,
          }}
          onSelectEvent={(event) => event.resource && onEventClick(event.resource)}
          onSelectSlot={onSlotSelect}
          selectable
          views={['month', 'week', 'day']}
          defaultView="month"
          popup
          popupOffset={10}
          showMultiDayTimes
          // Custom messages
          messages={{
            allDay: 'All Day',
            previous: 'Previous',
            next: 'Next',
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Time',
            event: 'Event',
            showMore: (total) => `+${total} more`,
          }}
        />
      </div>

      {/* Legend */}
      <div className="px-6 pb-6 pt-0">
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Event Types</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
              <div key={type} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ 
                    backgroundColor: 
                      config.color === 'blue' ? '#3B82F6' :
                      config.color === 'purple' ? '#8B5CF6' :
                      config.color === 'green' ? '#10B981' :
                      config.color === 'orange' ? '#F59E0B' :
                      config.color === 'brown' ? '#92400E' :
                      config.color === 'gold' ? '#F59E0B' :
                      '#6B7280'
                  }}
                />
                <span className="text-xs text-gray-600">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 