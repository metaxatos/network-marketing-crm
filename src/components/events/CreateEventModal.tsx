'use client';

import { useState, useEffect } from 'react';
import { Event, CreateEventData, EventType, EventFormat, MeetingPlatform, EVENT_TYPE_CONFIG } from '@/types/events';
import { createEvent } from '@/actions/events';
import { generateJitsiLink, generateEventRoomName, isValidMeetingUrl } from '@/lib/video-conferencing';
import { format, addHours } from 'date-fns';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (event: Event) => void;
  initialData?: Partial<CreateEventData>;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
  initialData
}: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    event_type: 'team_meeting',
    format: 'online',
    start_time: '',
    end_time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    meeting_platform: 'jitsi',
    meeting_url: '',
    location_name: '',
    location_address: '',
    max_attendees: undefined,
    is_team_only: true,
    registration_required: false,
    tags: []
  });

  // Initialize form with default values or provided data
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const defaultStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const defaultEnd = addHours(defaultStart, 1); // 1 hour duration

      setFormData({
        title: '',
        description: '',
        event_type: 'team_meeting',
        format: 'online',
        start_time: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        meeting_platform: 'jitsi',
        meeting_url: '',
        location_name: '',
        location_address: '',
        max_attendees: undefined,
        is_team_only: true,
        registration_required: false,
        tags: [],
        ...initialData
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Generate Jitsi link when needed
  const handleGenerateJitsiLink = () => {
    if (!formData.title.trim()) {
      setErrors(prev => ({ ...prev, title: 'Please enter an event title first' }));
      return;
    }

    const roomName = generateEventRoomName({
      companyName: 'YourCompany', // Would get from user context
      eventTitle: formData.title,
      eventType: formData.event_type,
      timestamp: Date.now()
    });

    const jitsiUrl = generateJitsiLink({
      roomName,
      userDisplayName: 'Event Host', // Would get from user context
      userEmail: 'host@example.com' // Would get from user context
    });

    setFormData(prev => ({ ...prev, meeting_url: jitsiUrl }));
    
    // Clear any URL validation errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.meeting_url;
      return newErrors;
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    // Validate times
    if (formData.start_time && formData.end_time) {
      const startDate = new Date(formData.start_time);
      const endDate = new Date(formData.end_time);
      const now = new Date();

      if (startDate < now) {
        newErrors.start_time = 'Start time cannot be in the past';
      }

      if (endDate <= startDate) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    // Validate format-specific fields
    if (formData.format === 'online') {
      if (formData.meeting_platform === 'custom' && !formData.meeting_url?.trim()) {
        newErrors.meeting_url = 'Meeting URL is required for custom platform';
      }
      
      if (formData.meeting_url && !isValidMeetingUrl(formData.meeting_url)) {
        newErrors.meeting_url = 'Please enter a valid meeting URL';
      }
    } else {
      if (!formData.location_name?.trim()) {
        newErrors.location_name = 'Location name is required for in-person events';
      }
    }

    // Validate attendee limit
    if (formData.max_attendees && formData.max_attendees < 1) {
      newErrors.max_attendees = 'Maximum attendees must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const event = await createEvent(formData);
      onSuccess(event);
      onClose();
    } catch (error) {
      console.error('Failed to create event:', error);
      setErrors({ submit: 'Failed to create event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateEventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">✨</span>
                Create New Event
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Weekly Team Check-in"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => handleInputChange('event_type', e.target.value as EventType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Format Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Event Format *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('format', 'online')}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.format === 'online'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">💻</div>
                  <div className="font-semibold">Online</div>
                  <div className="text-sm text-gray-600">Virtual meeting</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('format', 'live')}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.format === 'live'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">📍</div>
                  <div className="font-semibold">In-Person</div>
                  <div className="text-sm text-gray-600">Physical location</div>
                </button>
              </div>
            </div>

            {/* Online Meeting Setup */}
            {formData.format === 'online' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">🎥</span>
                  Online Meeting Setup
                </h3>

                {/* Platform Selection */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('meeting_platform', 'jitsi');
                      if (!formData.meeting_url) {
                        handleGenerateJitsiLink();
                      }
                    }}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      formData.meeting_platform === 'jitsi'
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg mb-1">🎥</div>
                    <div className="font-medium">Jitsi Meet</div>
                    <div className="text-xs text-gray-600">Free & Easy</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('meeting_platform', 'custom');
                      handleInputChange('meeting_url', '');
                    }}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      formData.meeting_platform === 'custom'
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg mb-1">🔗</div>
                    <div className="font-medium">Custom Link</div>
                    <div className="text-xs text-gray-600">Zoom, Teams, etc.</div>
                  </button>
                </div>

                {/* Meeting URL */}
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Meeting Link
                  </label>
                  {formData.meeting_platform === 'jitsi' ? (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.meeting_url || ''}
                        onChange={(e) => handleInputChange('meeting_url', e.target.value)}
                        placeholder="Jitsi meeting URL will appear here"
                        className={`flex-1 px-3 py-2 bg-white border rounded-lg ${
                          errors.meeting_url ? 'border-red-500' : 'border-blue-300'
                        }`}
                        readOnly={!formData.meeting_url}
                      />
                      <button
                        type="button"
                        onClick={handleGenerateJitsiLink}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                      >
                        🔄 {formData.meeting_url ? 'Regenerate' : 'Generate'}
                      </button>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={formData.meeting_url || ''}
                      onChange={(e) => handleInputChange('meeting_url', e.target.value)}
                      placeholder="https://zoom.us/j/123456789 or https://meet.google.com/xyz-abc-def"
                      className={`w-full px-3 py-2 bg-white border rounded-lg ${
                        errors.meeting_url ? 'border-red-500' : 'border-blue-300'
                      }`}
                    />
                  )}
                  {errors.meeting_url && <p className="text-red-500 text-sm mt-1">{errors.meeting_url}</p>}
                  
                  {formData.meeting_platform === 'jitsi' && (
                    <p className="text-blue-600 text-xs mt-1">
                      ✨ Free video conferencing - no account needed for attendees!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Location Setup */}
            {formData.format === 'live' && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <span className="mr-2">📍</span>
                  Location Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={formData.location_name || ''}
                      onChange={(e) => handleInputChange('location_name', e.target.value)}
                      placeholder="e.g., Marriott Hotel, Conference Room A"
                      className={`w-full px-3 py-2 bg-white border rounded-lg ${
                        errors.location_name ? 'border-red-500' : 'border-green-300'
                      }`}
                    />
                    {errors.location_name && <p className="text-red-500 text-sm mt-1">{errors.location_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Full Address
                    </label>
                    <input
                      type="text"
                      value={formData.location_address || ''}
                      onChange={(e) => handleInputChange('location_address', e.target.value)}
                      placeholder="123 Business Ave, City, State 12345"
                      className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.start_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.end_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell attendees what to expect..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Event Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  value={formData.max_attendees || ''}
                  onChange={(e) => handleInputChange('max_attendees', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Leave empty for unlimited"
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.max_attendees ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.max_attendees && <p className="text-red-500 text-sm mt-1">{errors.max_attendees}</p>}
              </div>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_team_only}
                    onChange={(e) => handleInputChange('is_team_only', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Team only event</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.registration_required}
                    onChange={(e) => handleInputChange('registration_required', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require registration</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 bg-white/30 rounded-sm mr-2 animate-shimmer"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span>
                    Create Event
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 