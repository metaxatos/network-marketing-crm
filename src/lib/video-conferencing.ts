import { JitsiConfig, MEETING_PLATFORM_CONFIG } from '@/types/events';

/**
 * Generate a Jitsi Meet URL for an event
 */
export function generateJitsiLink(options: {
  roomName: string;
  userDisplayName?: string;
  userEmail?: string;
  domain?: string;
}): string {
  // Clean room name to be URL safe
  const cleanRoomName = options.roomName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .substring(0, 50)
    .toLowerCase();

  // Use custom domain or default to Jitsi Meet
  const domain = options.domain || 'meet.jit.si';
  
  // Base URL for Jitsi Meet
  let url = `https://${domain}/${cleanRoomName}`;
  
  // Add config parameters for user info
  const params = new URLSearchParams();
  if (options.userDisplayName) {
    params.append('config.userInfo.displayName', options.userDisplayName);
  }
  if (options.userEmail) {
    params.append('config.userInfo.email', options.userEmail);
  }

  // Add some default configurations for better user experience
  params.append('config.startWithAudioMuted', 'true');
  params.append('config.startWithVideoMuted', 'false');
  params.append('config.enableWelcomePage', 'false');
  
  // Append parameters if any exist
  if (params.toString()) {
    url += `#${params.toString()}`;
  }

  return url;
}

/**
 * Generate a unique room name for an event
 */
export function generateEventRoomName(options: {
  companyName: string;
  eventTitle: string;
  eventType: string;
  timestamp: number;
}): string {
  const { companyName, eventTitle, eventType, timestamp } = options;
  
  // Create a short, readable room name
  const company = companyName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  const title = eventTitle.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
  const type = eventType.replace(/_/g, '').substring(0, 8);
  const timeCode = timestamp.toString().slice(-6); // Last 6 digits
  
  return `${company}-${type}-${title}-${timeCode}`.toLowerCase();
}

/**
 * Create Jitsi configuration for embedding (optional feature)
 */
export function createJitsiConfig(options: JitsiConfig): any {
  return {
    roomName: options.roomName,
    width: '100%',
    height: '100%',
    userInfo: {
      email: options.userInfo?.email,
      displayName: options.userInfo?.displayName
    },
    configOverwrite: {
      startWithAudioMuted: true,
      startWithVideoMuted: false,
      disableModeratorIndicator: false,
      enableEmailInStats: false,
      enableWelcomePage: false,
      prejoinPageEnabled: false,
      // Celebration theme colors
      defaultLocalDisplayName: options.userInfo?.displayName || 'Guest',
    },
    interfaceConfigOverwrite: {
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'desktop', 'chat', 'recording',
        'livestreaming', 'etherpad', 'sharedvideo', 'settings',
        'raisehand', 'videoquality', 'filmstrip', 'feedback',
        'stats', 'shortcuts', 'tileview', 'download', 'help'
      ],
    }
  };
}

/**
 * Extract room name from a Jitsi URL
 */
export function extractRoomFromJitsiUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('jit.si') || urlObj.hostname.includes('meet.jit')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      return pathParts[0] || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate if a URL is a valid meeting URL
 */
export function isValidMeetingUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObject = new URL(url);
    
    // Check common meeting platforms
    const validPatterns = [
      /^https:\/\/meet\.jit\.si\/[a-zA-Z0-9-_]+/,
      /^https:\/\/meet\.google\.com\/[a-z-]+/,
      /^https:\/\/.*\.zoom\.us\/j\/\d+/,
      /^https:\/\/teams\.microsoft\.com\/l\/meetup-join\/.+/,
      /^https:\/\/.*\.webex\.com\/.+/,
      /^https:\/\/.*\.gotomeeting\.com\/.+/,
    ];
    
    return validPatterns.some(pattern => pattern.test(url));
  } catch {
    return false;
  }
}

/**
 * Extract meeting platform from URL
 */
export function getMeetingPlatform(url: string): string {
  if (!url) return 'custom';
  
  if (url.includes('meet.jit.si')) return 'jitsi';
  if (url.includes('meet.google.com')) return 'google_meet';
  if (url.includes('zoom.us')) return 'zoom';
  if (url.includes('teams.microsoft.com')) return 'teams';
  if (url.includes('webex.com')) return 'webex';
  if (url.includes('gotomeeting.com')) return 'gotomeeting';
  
  return 'custom';
}

/**
 * Get meeting platform display info
 */
export function getMeetingPlatformInfo(url?: string) {
  if (!url) return null;
  
  const platform = getMeetingPlatform(url);
  
  const platformInfo = {
    jitsi: { name: 'Jitsi Meet', icon: '🎥', color: 'blue' },
    google_meet: { name: 'Google Meet', icon: '📹', color: 'red' },
    zoom: { name: 'Zoom', icon: '🔍', color: 'blue' },
    teams: { name: 'Microsoft Teams', icon: '💼', color: 'purple' },
    webex: { name: 'Cisco Webex', icon: '📱', color: 'green' },
    gotomeeting: { name: 'GoToMeeting', icon: '🎪', color: 'orange' },
    custom: { name: 'Video Call', icon: '🔗', color: 'gray' }
  };
  
  return platformInfo[platform as keyof typeof platformInfo] || platformInfo.custom;
}

/**
 * Check if a meeting is currently live (started and not ended)
 */
export function isMeetingLive(startTime: string, endTime: string): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return now >= start && now <= end;
}

/**
 * Check if user can join meeting (started but within join window)
 */
export function canJoinMeeting(startTime: string, endTime: string, earlyJoinMinutes = 15): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  const earlyJoinTime = new Date(start.getTime() - earlyJoinMinutes * 60 * 1000);
  
  return now >= earlyJoinTime && now <= end;
}

/**
 * Generate Jitsi embed configuration
 */
export function generateJitsiConfig(options: {
  roomName: string;
  userDisplayName?: string;
  userEmail?: string;
  domain?: string;
  width?: string | number;
  height?: string | number;
}): JitsiConfig {
  return {
    roomName: options.roomName,
    userInfo: {
      displayName: options.userDisplayName,
      email: options.userEmail
    },
    configOverwrite: {
      startWithAudioMuted: true,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      enableUserRolesBasedOnToken: false
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'chat', 'desktop', 'fullscreen',
        'hangup', 'participants-pane', 'settings', 'videoquality'
      ],
      SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false
    }
  };
}

/**
 * Open meeting in new tab/window
 */
export function openMeeting(url: string, eventTitle?: string): void {
  if (!isValidMeetingUrl(url)) {
    console.error('Invalid meeting URL:', url);
    return;
  }
  
  const windowName = eventTitle ? `meeting-${eventTitle.replace(/[^a-zA-Z0-9]/g, '')}` : 'meeting';
  window.open(url, windowName, 'noopener,noreferrer');
}

/**
 * Copy meeting URL to clipboard
 */
export async function copyMeetingUrl(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy URL:', fallbackError);
      return false;
    }
  }
}

/**
 * Format meeting time for display
 */
export function formatMeetingTime(startTime: string, endTime: string, timezone?: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const timeFormat: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  };
  
  if (timezone) {
    timeFormat.timeZone = timezone;
  }
  
  const startFormatted = start.toLocaleTimeString([], timeFormat);
  const endFormatted = end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Generate calendar download links for events
 */
export function generateCalendarLinks(event: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
}) {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  
  // Format dates for calendar systems
  const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const details = [
    event.description,
    event.meetingUrl ? `Join Online: ${event.meetingUrl}` : '',
    event.location ? `Location: ${event.location}` : ''
  ].filter(Boolean).join('\n\n');

  // Google Calendar
  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.set('action', 'TEMPLATE');
  googleUrl.searchParams.set('text', event.title);
  googleUrl.searchParams.set('dates', `${formatDate(startDate)}/${formatDate(endDate)}`);
  googleUrl.searchParams.set('details', details);
  if (event.location || event.meetingUrl) {
    googleUrl.searchParams.set('location', event.location || event.meetingUrl || '');
  }

  // Outlook
  const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  outlookUrl.searchParams.set('subject', event.title);
  outlookUrl.searchParams.set('startdt', startDate.toISOString());
  outlookUrl.searchParams.set('enddt', endDate.toISOString());
  outlookUrl.searchParams.set('body', details);
  if (event.location || event.meetingUrl) {
    outlookUrl.searchParams.set('location', event.location || event.meetingUrl || '');
  }

  return {
    google: googleUrl.toString(),
    outlook: outlookUrl.toString(),
    // ICS file generation would need a separate function
  };
} 