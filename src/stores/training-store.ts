import { create } from 'zustand';
import type { TrainingVideo, MemberProgress } from '@/types/training';
import toast from 'react-hot-toast';

interface TrainingStore {
  // State
  videos: TrainingVideo[];
  categories: string[];
  currentVideo: TrainingVideo | null;
  videoProgress: Map<string, MemberProgress>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchVideos: () => Promise<void>;
  fetchVideosByCategory: (category: string) => Promise<void>;
  fetchVideo: (videoId: string) => Promise<void>;
  updateVideoProgress: (videoId: string, progressSeconds: number) => Promise<void>;
  markVideoComplete: (videoId: string) => Promise<void>;
  startWatching: (videoId: string) => Promise<void>;
  getRecommendedVideos: (currentVideoId: string) => TrainingVideo[];
  reset: () => void;
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  // Initial state
  videos: [],
  categories: [],
  currentVideo: null,
  videoProgress: new Map(),
  isLoading: false,
  error: null,

  // Fetch all published videos
  fetchVideos: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/training/courses'); // This now returns videos grouped by category
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      const allVideos = data.courses?.flatMap((category: any) => category.videos || []) || [];
      const categories = data.courses?.map((category: any) => category.category) || [];
      
      set({ 
        videos: allVideos, 
        categories: categories,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching videos:', error);
      set({ error: 'Failed to fetch videos', isLoading: false });
      toast.error('Failed to load training videos');
    }
  },

  // Fetch videos by category
  fetchVideosByCategory: async (category: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/training/courses?category=${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      const categoryVideos = data.courses?.find((c: any) => c.category === category)?.videos || [];
      
      set({ videos: categoryVideos, isLoading: false });
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      set({ error: 'Failed to fetch videos', isLoading: false });
      toast.error('Failed to load category videos');
    }
  },

  // Fetch single video with progress
  fetchVideo: async (videoId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/training/video/${videoId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }

      const data = await response.json();
      
      // Store progress if available
      if (data.progress) {
        get().videoProgress.set(videoId, data.progress);
      }

      set({ currentVideo: data.video, isLoading: false });
    } catch (error) {
      console.error('Error fetching video:', error);
      set({ error: 'Failed to fetch video', isLoading: false });
      toast.error('Failed to load video');
    }
  },

  // Start watching a video (creates progress entry)
  startWatching: async (videoId: string) => {
    try {
      const response = await fetch('/api/training/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start watching');
      }

      // Update local progress
      get().videoProgress.set(videoId, result.progress);
      set({}); // Trigger re-render
    } catch (error) {
      console.error('Error starting video:', error);
    }
  },

  // Update video progress
  updateVideoProgress: async (videoId: string, progressSeconds: number) => {
    try {
      const response = await fetch('/api/training/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          videoId, 
          progressSeconds 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update progress');
      }

      // Update local progress map
      const current = get().videoProgress.get(videoId);
      if (current) {
        get().videoProgress.set(videoId, {
          ...current,
          progress_seconds: progressSeconds,
          last_watched_at: new Date().toISOString(),
        });
      }

      set({}); // Trigger re-render
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  },

  // Mark video as complete
  markVideoComplete: async (videoId: string) => {
    try {
      const response = await fetch('/api/training/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          videoId, 
          completed: true 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark video complete');
      }

      // Update local progress map
      const current = get().videoProgress.get(videoId);
      if (current) {
        get().videoProgress.set(videoId, {
          ...current,
          completed: true,
          last_watched_at: new Date().toISOString(),
        });
      }

      set({}); // Trigger re-render
      toast.success('Video completed! 🎉');
    } catch (error) {
      console.error('Error marking video complete:', error);
      toast.error('Failed to mark video complete');
    }
  },

  // Get recommended videos based on current video
  getRecommendedVideos: (currentVideoId: string) => {
    const { videos } = get();
    const currentVideo = videos.find(v => v.id === currentVideoId);
    
    if (!currentVideo) return [];

    // Return videos from same category, excluding current video
    return videos
      .filter(v => 
        v.id !== currentVideoId && 
        v.category === currentVideo.category &&
        v.is_published
      )
      .slice(0, 3); // Limit to 3 recommendations
  },

  // Reset store
  reset: () => {
    set({
      videos: [],
      categories: [],
      currentVideo: null,
      videoProgress: new Map(),
      isLoading: false,
      error: null,
    });
  },
}));

// Deprecated exports for backward compatibility - no need to re-export

// Legacy hooks have been removed to prevent deprecated warnings
// Use useTrainingVideos and useVideoProgress from '@/hooks/queries/useTraining' instead
