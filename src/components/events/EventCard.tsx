'use client';

import { Event, EVENT_TYPE_CONFIG } from '@/types/events';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { getMeetingPlatform } from '@/lib/video-conferencing';

interface EventCardProps {
  event: Event;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onInvite: (event: Event) => void;
  onJoin?: (event: Event) => void;
}

export default function EventCard({ event, onView, onEdit, onInvite, onJoin }: EventCardProps) {
  const eventConfig = EVENT_TYPE_CONFIG[event.event_type];
  const isOnline = event.format === 'online';
  const eventDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const isEventToday = isToday(eventDate);
  const isEventPast = isPast(endDate);
  const isEventFuture = isFuture(eventDate);
  
  // Check if event is happening now (within 15 minutes before to end time)
  const now = new Date();
  const fifteenMinutesBefore = new Date(eventDate.getTime() - 15 * 60 * 1000);
  const isHappeningNow = now >= fifteenMinutesBefore && now <= endDate;

  const formatDateTime = (date: Date) => {
    return {
      date: format(date, 'MMM d, yyyy'),
      time: format(date, 'h:mm a')
    };
  };

  const startDateTime = formatDateTime(eventDate);
  const endDateTime = formatDateTime(endDate);

  // Get event type color mapping
  const getEventTypeStyles = () => {
    switch (eventConfig.color) {
      case 'blue':
        return {
          borderColor: 'border-l-blue-500',
          badgeColor: 'bg-blue-100 text-blue-700',
          iconBg: 'bg-blue-500'
        };
      case 'purple':
        return {
          borderColor: 'border-l-purple-500',
          badgeColor: 'bg-purple-100 text-purple-700',
          iconBg: 'bg-purple-500'
        };
      case 'green':
        return {
          borderColor: 'border-l-green-500',
          badgeColor: 'bg-green-100 text-green-700',
          iconBg: 'bg-green-500'
        };
      case 'orange':
        return {
          borderColor: 'border-l-orange-500',
          badgeColor: 'bg-orange-100 text-orange-700',
          iconBg: 'bg-orange-500'
        };
      case 'yellow':
        return {
          borderColor: 'border-l-yellow-500',
          badgeColor: 'bg-yellow-100 text-yellow-700',
          iconBg: 'bg-yellow-500'
        };
      default:
        return {
          borderColor: 'border-l-slate-500',
          badgeColor: 'bg-slate-100 text-slate-700',
          iconBg: 'bg-slate-500'
        };
    }
  };

  const eventStyles = getEventTypeStyles();

  const getStatusBadge = () => {
    if (isHappeningNow) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
          🔴 Live Now
        </span>
      );
    }
    if (isEventToday && isEventFuture) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          📅 Today
        </span>
      );
    }
    if (isEventPast) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          ✅ Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        🗓️ Upcoming
      </span>
    );
  };

  const getFormatBadge = () => {
    if (isOnline) {
      const platform = event.meeting_url ? getMeetingPlatform(event.meeting_url) : 'Online';
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          💻 {platform}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        📍 In-Person
      </span>
    );
  };

  return (
    <div className={`
      bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 
      ${eventStyles.borderColor} overflow-hidden cursor-pointer group
      ${isEventToday ? 'ring-2 ring-blue-200' : ''}
      ${isEventPast ? 'opacity-75' : ''}
      ${isHappeningNow ? 'ring-2 ring-red-200 shadow-xl' : ''}
      hover:scale-[1.02] hover:-translate-y-1
    `}>
      {/* Card Header */}
      <div className="p-5 pb-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Event Type Icon */}
            <div className={`w-12 h-12 ${eventStyles.iconBg} rounded-xl flex items-center justify-center text-white text-lg shadow-lg`}>
              {eventConfig.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-slate-900 line-clamp-2 mb-1 font-['Poppins']">
                {event.title}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${eventStyles.badgeColor}`}>
                {eventConfig.label}
              </span>
            </div>
          </div>
          
          {/* Dropdown Menu */}
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getStatusBadge()}
          {getFormatBadge()}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 pb-4">
        {/* Date and Time */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-slate-600">
            <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">{startDateTime.date}</span>
          </div>
          <div className="flex items-center text-slate-600">
            <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{startDateTime.time} - {endDateTime.time}</span>
          </div>
        </div>

        {/* Location/Meeting Info */}
        {(event.location_name || event.meeting_url) && (
          <div className="flex items-center text-slate-600 mb-4">
            <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm truncate">
              {isOnline ? 'Online Meeting' : event.location_name}
            </span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-slate-600 text-sm line-clamp-2 mb-4">
            {event.description}
          </p>
        )}

        {/* Attendee Info */}
        {event.registration_count && event.registration_count > 0 && (
          <div className="flex items-center gap-3 mb-4">
            {/* Attendee Avatars Placeholder */}
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, event.registration_count))].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              {event.registration_count > 3 && (
                <div className="w-8 h-8 bg-slate-100 rounded-full border-2 border-white flex items-center justify-center text-slate-600 text-xs font-medium">
                  +{event.registration_count - 3}
                </div>
              )}
            </div>
            <span className="text-sm text-slate-600">
              {event.registration_count} {event.registration_count === 1 ? 'attendee' : 'attendees'}
            </span>
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100">
        <div className="flex gap-2">
          {/* Join Button for Live Events */}
          {isHappeningNow && isOnline && event.meeting_url && (
            <button
              onClick={() => window.open(event.meeting_url, '_blank')}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium 
                       rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 animate-pulse
                       shadow-lg hover:shadow-xl active:scale-95"
            >
              🔴 Join Now
            </button>
          )}
          
          {/* Regular Action Buttons */}
          {!isHappeningNow && (
            <>
              <button
                onClick={() => onView(event)}
                className="flex-1 px-4 py-2.5 text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200 text-sm 
                         font-medium rounded-xl hover:bg-white hover:border-slate-300 transition-all duration-200
                         hover:shadow-sm active:scale-95"
              >
                View Details
              </button>
              
              {event.is_creator && (
                <button
                  onClick={() => onInvite(event)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium 
                           rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200
                           shadow-lg hover:shadow-xl active:scale-95"
                >
                  📧 Invite
                </button>
              )}
              
              {!event.is_creator && !isEventPast && (
                <button
                  onClick={() => onJoin?.(event)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium 
                           rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200
                           shadow-lg hover:shadow-xl active:scale-95"
                >
                  📝 Register
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 