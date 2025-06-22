'use client';

import { useState } from 'react';
import { Event, EVENT_TYPE_CONFIG } from '@/types/events';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { getMeetingPlatform } from '@/lib/video-conferencing';

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: Event) => void;
  onInvite?: (event: Event) => void;
}

export default function EventDetailsModal({ 
  event, 
  isOpen, 
  onClose, 
  onEdit, 
  onInvite 
}: EventDetailsModalProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!isOpen || !event) return null;

  const eventConfig = EVENT_TYPE_CONFIG[event.event_type];
  const isOnline = event.format === 'online';
  const eventDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const isEventToday = isToday(eventDate);
  const isEventPast = isPast(endDate);
  const isEventFuture = isFuture(eventDate);
  
  // Check if event is happening now
  const now = new Date();
  const fifteenMinutesBefore = new Date(eventDate.getTime() - 15 * 60 * 1000);
  const isHappeningNow = now >= fifteenMinutesBefore && now <= endDate;

  const formatDateTime = (date: Date) => {
    return {
      date: format(date, 'EEEE, MMMM d, yyyy'),
      time: format(date, 'h:mm a'),
      full: format(date, 'EEEE, MMMM d, yyyy \'at\' h:mm a')
    };
  };

  const startDateTime = formatDateTime(eventDate);
  const endDateTime = formatDateTime(endDate);

  const getEventTypeStyles = () => {
    switch (eventConfig.color) {
      case 'blue':
        return {
          borderColor: 'border-blue-500',
          badgeColor: 'bg-blue-100 text-blue-700',
          iconBg: 'bg-blue-500',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'purple':
        return {
          borderColor: 'border-purple-500',
          badgeColor: 'bg-purple-100 text-purple-700',
          iconBg: 'bg-purple-500',
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'green':
        return {
          borderColor: 'border-green-500',
          badgeColor: 'bg-green-100 text-green-700',
          iconBg: 'bg-green-500',
          gradient: 'from-green-500 to-green-600'
        };
      case 'orange':
        return {
          borderColor: 'border-orange-500',
          badgeColor: 'bg-orange-100 text-orange-700',
          iconBg: 'bg-orange-500',
          gradient: 'from-orange-500 to-orange-600'
        };
      case 'yellow':
        return {
          borderColor: 'border-yellow-500',
          badgeColor: 'bg-yellow-100 text-yellow-700',
          iconBg: 'bg-yellow-500',
          gradient: 'from-yellow-500 to-yellow-600'
        };
      default:
        return {
          borderColor: 'border-slate-500',
          badgeColor: 'bg-slate-100 text-slate-700',
          iconBg: 'bg-slate-500',
          gradient: 'from-slate-500 to-slate-600'
        };
    }
  };

  const eventStyles = getEventTypeStyles();

  const getStatusBadge = () => {
    if (isHappeningNow) {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 animate-pulse">
          🔴 Live Now
        </span>
      );
    }
    if (isEventToday && isEventFuture) {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          📅 Today
        </span>
      );
    }
    if (isEventPast) {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
          ✅ Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
        🗓️ Upcoming
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${eventStyles.gradient} px-6 py-8 text-white relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          </div>
          
          <div className="relative flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
                {eventConfig.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2 font-['Poppins']">
                  {event.title}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                  {eventConfig.label}
                </span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Status Badge */}
          <div className="flex flex-wrap gap-3 mb-6">
            {getStatusBadge()}
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isOnline ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            }`}>
              {isOnline ? `💻 ${event.meeting_url ? getMeetingPlatform(event.meeting_url) : 'Online'}` : '📍 In-Person'}
            </span>
          </div>

          {/* Date & Time */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Event Schedule
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Start:</span>
                <span className="font-medium text-slate-900">{startDateTime.full}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">End:</span>
                <span className="font-medium text-slate-900">{endDateTime.full}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Duration:</span>
                <span className="font-medium text-slate-900">
                  {Math.round((endDate.getTime() - eventDate.getTime()) / (1000 * 60))} minutes
                </span>
              </div>
            </div>
          </div>

          {/* Location/Meeting Info */}
          {(event.location_name || event.meeting_url) && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isOnline ? 'Meeting Link' : 'Location'}
              </h3>
              {isOnline ? (
                <div className="space-y-2">
                  <p className="text-slate-600">Platform: {getMeetingPlatform(event.meeting_url!)}</p>
                  {event.meeting_url && (
                    <button
                      onClick={() => window.open(event.meeting_url, '_blank')}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      🔗 Open Meeting Link
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-slate-900 font-medium">{event.location_name}</p>
                  {event.location_address && (
                    <p className="text-slate-600">{event.location_address}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </h3>
              <div className="text-slate-700 leading-relaxed">
                {showFullDescription || event.description.length <= 200 ? (
                  <p>{event.description}</p>
                ) : (
                  <>
                    <p>{event.description.slice(0, 200)}...</p>
                    <button
                      onClick={() => setShowFullDescription(true)}
                      className="text-blue-500 hover:text-blue-600 font-medium mt-2"
                    >
                      Show more
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.registration_count && event.registration_count > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Attendees ({event.registration_count})
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(5, event.registration_count))].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  {event.registration_count > 5 && (
                    <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white flex items-center justify-center text-slate-600 text-sm font-medium">
                      +{event.registration_count - 5}
                    </div>
                  )}
                </div>
                <span className="text-slate-600">
                  {event.registration_count} {event.registration_count === 1 ? 'person registered' : 'people registered'}
                </span>
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white rounded-full text-sm text-slate-600 border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex gap-3">
            {/* Join Button for Live Events */}
            {isHappeningNow && isOnline && event.meeting_url && (
              <button
                onClick={() => window.open(event.meeting_url, '_blank')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium 
                         rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 animate-pulse
                         shadow-lg hover:shadow-xl active:scale-95"
              >
                🔴 Join Live Now
              </button>
            )}
            
            {/* Regular Action Buttons */}
            {!isHappeningNow && (
              <>
                {event.is_creator && onInvite && (
                  <button
                    onClick={() => onInvite(event)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium 
                             rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200
                             shadow-lg hover:shadow-xl active:scale-95"
                  >
                    📧 Send Invites
                  </button>
                )}
                
                {event.is_creator && onEdit && (
                  <button
                    onClick={() => onEdit(event)}
                    className="px-6 py-3 text-slate-700 bg-white border border-slate-300 font-medium 
                             rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200
                             shadow-sm hover:shadow active:scale-95"
                  >
                    ✏️ Edit Event
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-slate-600 bg-white border border-slate-300 font-medium 
                           rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200
                           shadow-sm hover:shadow active:scale-95"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 