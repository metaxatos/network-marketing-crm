export interface TrainingVideo {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  video_url: string;
  video_platform: 'youtube' | 'vimeo' | 'wistia' | 'direct';
  thumbnail_url?: string;
  duration_seconds?: number;
  category?: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  progress?: MemberProgress;
}

export interface MemberProgress {
  id: string;
  member_id: string;
  video_id: string;
  progress_seconds: number;
  completed: boolean;
  last_watched_at?: string;
  created_at: string;
  updated_at: string;
  video?: TrainingVideo;
}

export interface UserProgress {
  total_videos: number;
  completed_videos: number;
  completion_percentage: number;
  total_watch_time: number;
  videos_by_category: Record<string, {
    total: number;
    completed: number;
    percentage: number;
  }>;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
}

export type VideoPlatform = 'youtube' | 'vimeo' | 'wistia' | 'direct'; 