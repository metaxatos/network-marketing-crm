'use client';

import { useEffect, useState } from 'react';
import { useLandingPageStore } from '@/stores/landing-page-store';
import { useUserStore } from '@/stores/userStore';
import { Loader2, Globe, Edit3, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function LandingPageDashboard() {
  const { member } = useUserStore();
  const { 
    landingPage, 
    isLoading, 
    fetchLandingPage, 
    updateLandingPage,
    publishLandingPage 
  } = useLandingPageStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    meta_title: '',
    meta_description: '',
    content: {
      headline: '',
      subheadline: '',
      description: ''
    }
  });

  useEffect(() => {
    fetchLandingPage();
  }, [fetchLandingPage]);

  useEffect(() => {
    if (landingPage) {
      setFormData({
        title: landingPage.title || '',
        meta_title: landingPage.meta_title || '',
        meta_description: landingPage.meta_description || '',
        content: {
          headline: landingPage.content?.headline || '',
          subheadline: landingPage.content?.subheadline || '',
          description: landingPage.content?.description || ''
        }
      });
    }
  }, [landingPage]);

  const handleSave = async () => {
    await updateLandingPage(formData);
    setIsEditing(false);
  };

  const handlePublishToggle = async () => {
    if (!landingPage) return;
    await publishLandingPage(!landingPage.is_published);
  };

  const copyLink = () => {
    if (!member?.username) return;
    const url = `${window.location.origin}/public/${member.username}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard! 📋');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 bg-primary-200 rounded-lg animate-shimmer"></div>
      </div>
    );
  }

  if (!member?.username) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Set Up Your Username First</h2>
        <p className="text-gray-600 mb-4">
          You need to set up your username before creating a landing page.
        </p>
        <Button onClick={() => window.location.href = '/settings'}>
          Go to Settings
        </Button>
      </div>
    );
  }

  const landingPageUrl = `${window.location.origin}/public/${member.username}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Globe className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Landing Page</h1>
              <p className="text-gray-600">Customize your public landing page</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={copyLink}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <a
              href={landingPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button variant="secondary" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </a>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {landingPage?.is_published ? (
              <>
                <Eye className="h-5 w-5 text-success-600" />
                <span className="text-sm font-medium text-success-700">Published</span>
              </>
            ) : (
              <>
                <EyeOff className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Unpublished</span>
              </>
            )}
          </div>
          
          <Button
            onClick={handlePublishToggle}
            variant={landingPage?.is_published ? 'secondary' : 'primary'}
            size="sm"
          >
            {landingPage?.is_published ? 'Unpublish' : 'Publish Page'}
          </Button>
        </div>
      </div>

      {/* Page URL */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Your Landing Page URL</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={landingPageUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
          <Button onClick={copyLink} size="sm">
            Copy
          </Button>
        </div>
      </div>

      {/* Content Editor */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Page Content</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Content
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* SEO Settings */}
          <div>
            <h3 className="font-medium mb-3">SEO Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Page Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  disabled={!isEditing}
                  placeholder="My Landing Page"
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  disabled={!isEditing}
                  placeholder="A brief description of your page for search engines"
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div>
            <h3 className="font-medium mb-3">Page Content</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Headline</label>
                <input
                  type="text"
                  value={formData.content.headline}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    content: { ...formData.content, headline: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="Welcome to My Page"
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subheadline</label>
                <input
                  type="text"
                  value={formData.content.subheadline}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    content: { ...formData.content, subheadline: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="Learn more about what I do"
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={4}
                  value={formData.content.description}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    content: { ...formData.content, description: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="Tell visitors about yourself and what you offer..."
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note about templates */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a basic configuration. Custom templates specific to your company will be available soon.
        </p>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <a href="/dashboard" className="nav-item">
          <div className="text-2xl mb-1">🏠</div>
          <span className="text-xs font-medium">Home</span>
        </a>
        
        <a href="/contacts" className="nav-item">
          <div className="text-2xl mb-1">👥</div>
          <span className="text-xs font-medium">Contacts</span>
        </a>
        
        <a href="/emails" className="nav-item">
          <div className="text-2xl mb-1">📧</div>
          <span className="text-xs font-medium">Email</span>
        </a>
        
        <a href="/dashboard/training" className="nav-item">
          <div className="text-2xl mb-1">🎓</div>
          <span className="text-xs font-medium">Learn</span>
        </a>
        
        <div className="nav-item active">
          <div className="text-2xl mb-1">🌐</div>
          <span className="text-xs font-medium">Page</span>
        </div>
      </nav>
    </div>
  );
} 