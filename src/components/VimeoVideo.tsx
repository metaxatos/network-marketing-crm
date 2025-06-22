'use client'

import { useEffect, useRef, useState } from 'react'

interface VimeoVideoProps {
  videoId: string
  className?: string
  title?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  responsive?: boolean
  onReady?: () => void
  onProgress?: (seconds: number) => void
  startTime?: number
}

export function VimeoVideo({ 
  videoId, 
  className = '', 
  title = 'Video',
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  responsive = true,
  onReady,
  onProgress,
  startTime = 0
}: VimeoVideoProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract video ID from URL if full URL is provided
  const extractVideoId = (input: string): string => {
    if (/^\d+$/.test(input)) return input
    const match = input.match(/vimeo\.com\/(\d+)/)
    return match ? match[1] : input
  }

  const cleanVideoId = extractVideoId(videoId)

  useEffect(() => {
    if (!cleanVideoId || !iframeRef.current) {
      setError('Invalid video ID')
      setIsLoading(false)
      return
    }

    const iframe = iframeRef.current

    const handleLoad = () => {
      setIsLoading(false)
      setError(null)
      
      // Set up event listeners after iframe loads
      if (iframe.contentWindow) {
        // Add event listeners
        iframe.contentWindow.postMessage(
          JSON.stringify({ method: 'addEventListener', value: 'play' }),
          '*'
        )
        iframe.contentWindow.postMessage(
          JSON.stringify({ method: 'addEventListener', value: 'pause' }),
          '*'
        )
        iframe.contentWindow.postMessage(
          JSON.stringify({ method: 'addEventListener', value: 'ended' }),
          '*'
        )
        iframe.contentWindow.postMessage(
          JSON.stringify({ method: 'addEventListener', value: 'timeupdate' }),
          '*'
        )

        // Set start time if provided
        if (startTime > 0) {
          setTimeout(() => {
            iframe.contentWindow?.postMessage(
              JSON.stringify({ method: 'setCurrentTime', value: startTime }),
              '*'
            )
          }, 1000)
        }
      }
      
      onReady?.()
    }

    const handleError = () => {
      setError('Failed to load video')
      setIsLoading(false)
    }

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('vimeo.com')) return
      try {
        const data = JSON.parse(event.data)
        if (data.event === 'timeupdate' && data.data?.seconds) {
          onProgress?.(data.data.seconds)
        }
      } catch (err) {
        console.error('Error parsing Vimeo message:', err)
      }
    }

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)
    window.addEventListener('message', handleMessage)

    return () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
      window.removeEventListener('message', handleMessage)
    }
  }, [cleanVideoId, onReady, onProgress, startTime])

  if (!cleanVideoId) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg p-8 ${className}`}>
        <p className="text-gray-500">Invalid video ID</p>
      </div>
    )
  }

  // Build embed URL with all parameters
  const embedParams = new URLSearchParams({
    api: '1',
    player_id: 'vimeo-player',
    autoplay: autoplay ? '1' : '0',
    muted: muted ? '1' : '0',
    loop: loop ? '1' : '0',
    controls: controls ? '1' : '0',
    title: '0',
    byline: '0',
    portrait: '0',
    dnt: '1',
    app_id: '122963'
  })

  const embedUrl = `https://player.vimeo.com/video/${cleanVideoId}?${embedParams.toString()}`

  return (
    <div 
      className={`relative ${responsive ? 'w-full' : ''} ${className}`}
      style={responsive ? { paddingBottom: '56.25%' } : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        id="vimeo-player"
        src={embedUrl}
        title={title}
        className={`${responsive ? 'absolute inset-0 w-full h-full' : ''} rounded-lg`}
        style={!responsive ? { width: '100%', height: '400px' } : undefined}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
