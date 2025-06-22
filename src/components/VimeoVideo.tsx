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
  }, [cleanVideoId, onReady, onProgress])

  if (!cleanVideoId) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg p-8 ${className}`}>
        <p className="text-gray-500">Invalid video ID</p>
      </div>
    )
  }

  const embedUrl = `https://player.vimeo.com/video/${cleanVideoId}?api=1&player_id=vimeo-player`

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
