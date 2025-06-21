'use client';

import { useEffect, useRef, useState } from 'react';
import type { VideoPlatform } from '@/types/training';
import { useUpdateVideoProgress } from '@/hooks/queries/useTraining';

interface VideoPlayerProps {
  videoId: string;
  url: string;
  platform: VideoPlatform;
  initialProgress?: number;
  onProgress?: (seconds: number) => void;
  onEnd?: () => void;
  autoSave?: boolean; // Automatically save progress
}

export function VideoPlayer({ 
  videoId,
  url, 
  platform, 
  initialProgress = 0,
  onProgress,
  onEnd,
  autoSave = true
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // React Query mutation for updating progress
  const { mutate: updateProgress } = useUpdateVideoProgress();

  // Extract video ID from URL
  const getVideoId = (url: string, platform: VideoPlatform): string => {
    switch (platform) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return youtubeMatch?.[1] || '';
      case 'vimeo':
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        return vimeoMatch?.[1] || '';
      case 'wistia':
        const wistiaMatch = url.match(/(?:wistia\.com\/medias\/|fast\.wistia\.net\/embed\/iframe\/)([a-zA-Z0-9]+)/);
        return wistiaMatch?.[1] || '';
      default:
        return '';
    }
  };

  const embeddedVideoId = getVideoId(url, platform);

  // Debounced progress save
  const saveProgress = (seconds: number, completed = false) => {
    if (!autoSave || !videoId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save to avoid too many API calls
    saveTimeoutRef.current = setTimeout(() => {
      updateProgress({
        videoId: videoId,
        progressSeconds: Math.floor(seconds),
        completed
      });
    }, 2000); // Save after 2 seconds of no progress change
  };

  // Handle progress updates
  const handleProgressUpdate = (seconds: number) => {
    setCurrentTime(seconds);
    onProgress?.(seconds);
    
    if (autoSave) {
      saveProgress(seconds);
    }
  };

  // Handle video completion
  const handleVideoEnd = () => {
    if (autoSave && videoId) {
      // Immediately save completion
      updateProgress({
        videoId: videoId,
        progressSeconds: Math.floor(currentTime),
        completed: true
      });
    }
    onEnd?.();
  };

  useEffect(() => {
    if (!embeddedVideoId || !containerRef.current) return;

    // Load platform-specific scripts
    switch (platform) {
      case 'youtube':
        loadYouTubePlayer();
        break;
      case 'vimeo':
        loadVimeoPlayer();
        break;
      case 'wistia':
        loadWistiaPlayer();
        break;
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Cleanup players
      if (playerRef.current) {
        switch (platform) {
          case 'youtube':
            playerRef.current.destroy?.();
            break;
          case 'vimeo':
            playerRef.current.destroy?.();
            break;
          case 'wistia':
            playerRef.current.remove?.();
            break;
        }
      }
    };
  }, [embeddedVideoId, platform]);

  const loadYouTubePlayer = () => {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      initYouTubePlayer();
    } else {
      // Load YouTube API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initYouTubePlayer;
    }
  };

  const initYouTubePlayer = () => {
    if (!containerRef.current) return;

    const playerId = `youtube-player-${embeddedVideoId}`;
    containerRef.current.innerHTML = `<div id="${playerId}"></div>`;

    playerRef.current = new window.YT.Player(playerId, {
      videoId: embeddedVideoId,
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        start: Math.floor(initialProgress)
      },
      events: {
        onReady: (event: any) => {
          setIsReady(true);
          if (initialProgress > 0) {
            event.target.seekTo(initialProgress, true);
          }
          startProgressTracking();
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            handleVideoEnd();
          }
        }
      }
    });
  };

  const loadVimeoPlayer = () => {
    // Check if Vimeo API is already loaded
    if (window.Vimeo) {
      initVimeoPlayer();
    } else {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.onload = initVimeoPlayer;
      document.body.appendChild(script);
    }
  };

  const initVimeoPlayer = () => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = `
      <iframe 
        src="https://player.vimeo.com/video/${embeddedVideoId}?autoplay=0#t=${Math.floor(initialProgress)}s" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        allow="autoplay; fullscreen; picture-in-picture" 
        allowfullscreen
      ></iframe>
    `;

    const iframe = containerRef.current.querySelector('iframe');
    if (iframe && window.Vimeo) {
      playerRef.current = new window.Vimeo.Player(iframe);
      
      playerRef.current.on('loaded', () => {
        setIsReady(true);
        if (initialProgress > 0) {
          playerRef.current.setCurrentTime(initialProgress);
        }
        startProgressTracking();
      });

      playerRef.current.on('ended', () => {
        handleVideoEnd();
      });
    }
  };

  const loadWistiaPlayer = () => {
    // Add Wistia script
    const script1 = document.createElement('script');
    script1.src = `https://fast.wistia.com/embed/medias/${embeddedVideoId}.jsonp`;
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://fast.wistia.com/assets/external/E-v1.js';
    script2.async = true;
    script2.onload = () => {
      setTimeout(initWistiaPlayer, 100);
    };
    document.body.appendChild(script2);
  };

  const initWistiaPlayer = () => {
    if (!containerRef.current || !window._wq) return;

    containerRef.current.innerHTML = `
      <div class="wistia_embed wistia_async_${embeddedVideoId}" style="width:100%;height:100%;"></div>
    `;

    window._wq = window._wq || [];
    window._wq.push({
      id: embeddedVideoId,
      onReady: (video: any) => {
        playerRef.current = video;
        setIsReady(true);
        
        if (initialProgress > 0) {
          video.time(initialProgress);
        }
        
        startProgressTracking();
        
        video.bind('end', () => {
          handleVideoEnd();
        });
      }
    });
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (!playerRef.current) return;

      let currentSeconds = 0;

      switch (platform) {
        case 'youtube':
          if (playerRef.current.getCurrentTime) {
            currentSeconds = playerRef.current.getCurrentTime();
          }
          break;
        case 'vimeo':
          if (playerRef.current.getCurrentTime) {
            playerRef.current.getCurrentTime().then((time: number) => {
              handleProgressUpdate(time);
            });
            return; // Don't call handleProgressUpdate below for Vimeo
          }
          break;
        case 'wistia':
          if (playerRef.current.time) {
            currentSeconds = playerRef.current.time();
          }
          break;
      }

      if (platform !== 'vimeo') {
        handleProgressUpdate(currentSeconds);
      }
    }, 1000); // Update every second
  };

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="text-white text-lg">Loading video...</div>
        </div>
      )}
    </div>
  );
}

// Window type extension for video APIs
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    Vimeo: any;
    _wq: any[];
  }
} 