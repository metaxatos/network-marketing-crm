export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  modules?: Module[];
  enrollment?: CourseEnrollment;
  progress?: CourseProgress;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
  course?: Course;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_platform: 'youtube' | 'vimeo' | 'wistia';
  duration_seconds: number | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  progress?: LessonProgress;
  module?: Module;
}

export interface LessonProgress {
  id: string;
  member_id: string;
  lesson_id: string;
  progress_seconds: number;
  completed: boolean;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
  lesson?: Lesson;
}

export interface CourseEnrollment {
  id: string;
  member_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  course?: Course;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  totalDuration: number;
  watchedDuration: number;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
}

export type VideoPlatform = 'youtube' | 'vimeo' | 'wistia'; 