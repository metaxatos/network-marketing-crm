import { create } from 'zustand';
import type { Course, Module, Lesson, LessonProgress, CourseEnrollment } from '@/types/training';
import toast from 'react-hot-toast';

interface TrainingStore {
  // State
  courses: Course[];
  enrollments: CourseEnrollment[];
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  lessonProgress: Map<string, LessonProgress>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCourses: () => Promise<void>;
  fetchCourseWithModules: (courseId: string) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  fetchLessonWithProgress: (lessonId: string) => Promise<void>;
  updateLessonProgress: (lessonId: string, progressSeconds: number) => Promise<void>;
  markLessonComplete: (lessonId: string) => Promise<void>;
  getNextLesson: (currentLessonId: string) => Lesson | null;
  getPreviousLesson: (currentLessonId: string) => Lesson | null;
  reset: () => void;
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  // Initial state
  courses: [],
  enrollments: [],
  currentCourse: null,
  currentLesson: null,
  lessonProgress: new Map(),
  isLoading: false,
  error: null,

  // Fetch all published courses
  fetchCourses: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/training/courses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      set({ courses: data.courses || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching courses:', error);
      set({ error: 'Failed to fetch courses', isLoading: false });
      toast.error('Failed to load courses');
    }
  },

  // Fetch course with all modules and lessons
  fetchCourseWithModules: async (courseId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/training/${courseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }

      const data = await response.json();
      
      // Store lesson progress in map
      if (data.course.modules) {
        data.course.modules.forEach((module: any) => {
          if (module.lessons) {
            module.lessons.forEach((lesson: any) => {
              if (lesson.progress) {
                get().lessonProgress.set(lesson.id, lesson.progress);
              }
            });
          }
        });
      }

      set({ currentCourse: data.course, isLoading: false });
    } catch (error) {
      console.error('Error fetching course:', error);
      set({ error: 'Failed to fetch course details', isLoading: false });
      toast.error('Failed to load course details');
    }
  },

  // Enroll in a course
  enrollInCourse: async (courseId: string) => {
    try {
      const response = await fetch('/api/training/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to enroll in course');
      }

      toast.success('Successfully enrolled in course! 🎉');
      
      // Refresh courses to update enrollment status
      await get().fetchCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enroll in course');
    }
  },

  // Fetch lesson with progress
  fetchLessonWithProgress: async (lessonId: string) => {
    set({ isLoading: true, error: null });
    // TODO: Implement lesson detail API endpoint
    set({ isLoading: false });
  },

  // Update lesson progress
  updateLessonProgress: async (lessonId: string, progressSeconds: number) => {
    try {
      const response = await fetch('/api/training/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId, progressSeconds }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update progress');
      }

      // Update local progress map
      const current = get().lessonProgress.get(lessonId);
      if (current) {
        get().lessonProgress.set(lessonId, {
          ...current,
          progress_seconds: progressSeconds,
          last_watched_at: new Date().toISOString(),
        });
      }

      set({}); // Trigger re-render
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  },

  // Mark lesson as complete
  markLessonComplete: async (lessonId: string) => {
    try {
      const response = await fetch('/api/training/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId, completed: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark lesson complete');
      }

      // Update local progress map
      const current = get().lessonProgress.get(lessonId);
      if (current) {
        get().lessonProgress.set(lessonId, {
          ...current,
          completed: true,
          last_watched_at: new Date().toISOString(),
        });
      }

      set({}); // Trigger re-render
      toast.success('Lesson completed! 🎉');
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('Failed to mark lesson complete');
    }
  },

  // Get next lesson in the course
  getNextLesson: (currentLessonId: string) => {
    const { currentCourse } = get();
    if (!currentCourse?.modules) return null;

    let foundCurrent = false;
    for (const module of currentCourse.modules) {
      if (!module.lessons) continue;
      for (const lesson of module.lessons) {
        if (foundCurrent) return lesson;
        if (lesson.id === currentLessonId) foundCurrent = true;
      }
    }
    return null;
  },

  // Get previous lesson in the course
  getPreviousLesson: (currentLessonId: string) => {
    const { currentCourse } = get();
    if (!currentCourse?.modules) return null;

    let previousLesson = null;
    for (const module of currentCourse.modules) {
      if (!module.lessons) continue;
      for (const lesson of module.lessons) {
        if (lesson.id === currentLessonId) return previousLesson;
        previousLesson = lesson;
      }
    }
    return null;
  },

  // Reset store
  reset: () => {
    set({
      courses: [],
      enrollments: [],
      currentCourse: null,
      currentLesson: null,
      lessonProgress: new Map(),
      isLoading: false,
      error: null,
    });
  },
})); 