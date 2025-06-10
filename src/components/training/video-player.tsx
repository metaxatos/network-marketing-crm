'use client';

import { useEffect, useRef, useState } from 'react';
import type { VideoPlatform } from '@/types/training';

interface VideoPlayerProps {
  url: string;
  platform: VideoPlatform;
  initialProgress?: number;
  onProgress?: (seconds: number) => void;
  onEnd?: () => void;
}

export function VideoPlayer({ 
  url, 
  platform, 
  initialProgress = 0,
  onProgress,
  onEnd 
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const videoId = getVideoId(url, platform);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;

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
  }, [videoId, platform]);

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

    const playerId = `youtube-player-${videoId}`;
    containerRef.current.innerHTML = `<div id="${playerId}"></div>`;

    playerRef.current = new window.YT.Player(playerId, {
      videoId: videoId,
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        start: initialProgress
      },
      events: {
        onReady: (event: any) => {
          setIsReady(true);
          startProgressTracking();
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            onEnd?.();
          }
        }
      }
    });
  };

  const loadVimeoPlayer = () => {
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onload = initVimeoPlayer;
    document.body.appendChild(script);
  };

  const initVimeoPlayer = () => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = `
      <iframe 
        src="https://player.vimeo.com/video/${videoId}?autoplay=0#t=${initialProgress}s" 
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
        onEnd?.();
      });
    }
  };

  const loadWistiaPlayer = () => {
    // Add Wistia script
    const script1 = document.createElement('script');
    script1.src = `https://fast.wistia.com/embed/medias/${videoId}.jsonp`;
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
      <div class="wistia_embed wistia_async_${videoId}" style="width:100%;height:100%;"></div>
    `;

    window._wq = window._wq || [];
    window._wq.push({
      id: videoId,
      onReady: (video: any) => {
        playerRef.current = video;
        setIsReady(true);
        
        if (initialProgress > 0) {
          video.time(initialProgress);
        }
        
        video.bind('end', () => {
          onEnd?.();
        });
        
        startProgressTracking();
      }
    });
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (!playerRef.current) return;

      switch (platform) {
        case 'youtube':
          const ytTime = playerRef.current.getCurrentTime?.();
          if (ytTime !== undefined) {
            onProgress?.(ytTime);
          }
          break;
        case 'vimeo':
          playerRef.current.getCurrentTime?.().then((seconds: number) => {
            onProgress?.(seconds);
          });
          break;
        case 'wistia':
          const wistiaTime = playerRef.current.time?.();
          if (wistiaTime !== undefined) {
            onProgress?.(wistiaTime);
          }
          break;
      }
    }, 5000); // Update every 5 seconds
  };

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div 
        ref={containerRef} 
        className="absolute inset-0 bg-gray-900"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full">
            <div className="text-white">Loading video...</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add types for global window objects
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    Vimeo: any;
    _wq: any[];
  }
} 