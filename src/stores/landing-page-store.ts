import { create } from 'zustand';
import type { LandingPage, LeadCapture } from '@/types';
import toast from 'react-hot-toast';

interface LandingPageStore {
  // State
  landingPage: LandingPage | null;
  leads: LeadCapture[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLandingPage: () => Promise<void>;
  updateLandingPage: (updates: Partial<LandingPage>) => Promise<void>;
  publishLandingPage: (publish: boolean) => Promise<void>;
  fetchLeads: () => Promise<void>;
  submitLead: (pageId: string, leadData: any) => Promise<{ success: boolean }>;
  reset: () => void;
}

export const useLandingPageStore = create<LandingPageStore>((set, get) => ({
  // Initial state
  landingPage: null,
  leads: [],
  isLoading: false,
  error: null,

  // Fetch member's landing pages
  fetchLandingPage: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/landing-pages');
      
      if (!response.ok) {
        throw new Error('Failed to fetch landing pages');
      }

      const data = await response.json();
      // Use the first landing page if multiple exist
      const landingPage = data.landingPages?.[0] || null;
      
      set({ landingPage, isLoading: false });
    } catch (error) {
      console.error('Error fetching landing page:', error);
      set({ error: 'Failed to fetch landing page', isLoading: false });
    }
  },

  // Update landing page
  updateLandingPage: async (updates: Partial<LandingPage>) => {
    const { landingPage } = get();

    if (!landingPage) {
      toast.error('No landing page found');
      return;
    }

    try {
      const response = await fetch(`/api/landing-pages/${landingPage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update landing page');
      }

      set({ landingPage: result.landingPage });
      toast.success('Landing page updated! 🎉');
    } catch (error) {
      console.error('Error updating landing page:', error);
      toast.error('Failed to update landing page');
    }
  },

  // Publish/unpublish landing page
  publishLandingPage: async (publish: boolean) => {
    await get().updateLandingPage({ is_published: publish });
    toast.success(publish ? 'Landing page published! 🚀' : 'Landing page unpublished');
  },

  // Fetch leads from the simplified landing page
  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { landingPage } = get();
      if (landingPage) {
        const response = await fetch(`/api/landing-pages/${landingPage.id}/leads`);
        if (response.ok) {
          const data = await response.json();
          set({ leads: data.leads || [], isLoading: false });
        } else {
          set({ leads: [], isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      set({ error: 'Failed to fetch leads', isLoading: false });
    }
  },

  // Submit lead (uses public API endpoint)
  submitLead: async (pageId: string, leadData: any) => {
    try {
      const { landingPage } = get();
      if (!landingPage) {
        return { success: false };
      }

      const response = await fetch(`/api/pages/${landingPage.slug}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to submit lead');
        return { success: false };
      }

      toast.success('Thank you! We\'ll be in touch soon! 🎉');
      return { success: true };
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to submit lead');
      return { success: false };
    }
  },

  // Reset store
  reset: () => {
    set({
      landingPage: null,
      leads: [],
      isLoading: false,
      error: null,
    });
  },
})); 