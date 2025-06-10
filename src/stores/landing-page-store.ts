import { create } from 'zustand';
import type { 
  LandingPage, 
  LeadSubmission, 
  PageVisit, 
  PageAnalytics,
  PageTemplate 
} from '@/types/landing-pages';
import toast from 'react-hot-toast';

interface LandingPageStore {
  // State
  landingPage: LandingPage | null;
  leads: LeadSubmission[];
  analytics: PageAnalytics[];
  templates: PageTemplate[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLandingPage: () => Promise<void>;
  updateLandingPage: (updates: Partial<LandingPage>) => Promise<void>;
  publishLandingPage: (publish: boolean) => Promise<void>;
  fetchLeads: () => Promise<void>;
  fetchAnalytics: (days?: number) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  trackPageVisit: (username: string, utm?: any) => Promise<void>;
  submitLead: (pageId: string, leadData: any) => Promise<{ success: boolean }>;
  reset: () => void;
}

export const useLandingPageStore = create<LandingPageStore>((set, get) => ({
  // Initial state
  landingPage: null,
  leads: [],
  analytics: [],
  templates: [],
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

  // Fetch leads (placeholder - could be implemented as separate API endpoint)
  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // For now, get leads from landing page analytics
      // TODO: Implement separate leads API endpoint if needed
      const { landingPage } = get();
      if (landingPage) {
        // Could fetch leads here from a dedicated endpoint
        set({ leads: [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      set({ error: 'Failed to fetch leads', isLoading: false });
    }
  },

  // Fetch analytics (placeholder - could be implemented as separate API endpoint)
  fetchAnalytics: async (days = 30) => {
    set({ isLoading: true, error: null });
    
    try {
      // For now, use basic analytics from landing page data
      // TODO: Implement dedicated analytics API endpoint if needed
      const { landingPage } = get();
      if (landingPage) {
        // Could fetch detailed analytics here from a dedicated endpoint
        set({ analytics: [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      set({ error: 'Failed to fetch analytics', isLoading: false });
    }
  },

  // Fetch available templates (placeholder - could be implemented as separate API endpoint)
  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Implement templates API endpoint if needed
      set({ templates: [], isLoading: false });
    } catch (error) {
      console.error('Error fetching templates:', error);
      set({ error: 'Failed to fetch templates', isLoading: false });
    }
  },

  // Track page visit (uses public API endpoint)
  trackPageVisit: async (username: string, utm?: any) => {
    try {
      // This would be called from the public landing page
      // The public landing page route already handles visit tracking
      console.log('Page visit tracked for:', username, utm);
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  },

  // Submit lead (uses public API endpoint)
  submitLead: async (pageId: string, leadData: any) => {
    try {
      // Get the page slug for the API call
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
      analytics: [],
      templates: [],
      isLoading: false,
      error: null,
    });
  },
})); 