'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, Play, CheckCircle, Users } from 'lucide-react';
import type { TrainingVideo, MemberProgress } from '@/types/training';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useStartWatchingVideo, useCompleteVideo } from '@/hooks/queries/useTraining';

interface VideoCardProps {
  video: TrainingVideo;
  progress?: MemberProgress;
  className?: string;
}

export function VideoCard({ video, progress, className = '' }: VideoCardProps) {
  const { mutate: startWatching, isPending: isStarting } = useStartWatchingVideo();
  const { mutate: completeVideo, isPending: isCompleting } = useCompleteVideo();

  const handleStartWatching = async (e: React.MouseEvent) => {
    e.preventDefault();
    startWatching(video.id);
  };

  const handleMarkComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    completeVideo(video.id);
  };

  const progressPercentage = progress 
    ? Math.round((progress.progress_seconds / (video.duration_seconds || 1)) * 100)
    : 0;

  const isCompleted = progress?.completed || false;
  const hasStarted = progress && progress.progress_seconds > 0;

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${className}`}>
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🎥</div>
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
        </div>
        
        {/* Progress indicator */}
        {hasStarted && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
            <div className="flex items-center space-x-2">
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success-600" />
                  <span className="text-sm font-medium">Complete</span>
                </>
              ) : (
                <span className="text-sm font-medium">{progressPercentage}%</span>
              )}
            </div>
          </div>
        )}

        {/* Category tag */}
        {video.category && (
          <div className="absolute top-4 left-4 bg-primary-600/80 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-sm font-medium text-white">{video.category}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
        
        {video.description && (
          <p className="text-gray-600 line-clamp-3">{video.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {video.duration_seconds && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(video.duration_seconds)}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Play className="h-4 w-4" />
            <span>Video</span>
          </div>
          {video.video_platform && (
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="capitalize">{video.video_platform}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {hasStarted && !isCompleted && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {hasStarted ? (
            <Link href={`/dashboard/training/video/${video.id}`} className="flex-1">
              <Button className="w-full">
                {isCompleted ? 'Watch Again' : 'Continue Watching'}
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={handleStartWatching} 
              className="flex-1"
              disabled={isStarting}
            >
              {isStarting ? 'Starting...' : 'Start Watching'}
            </Button>
          )}
          
          {hasStarted && !isCompleted && (
            <Button 
              variant="secondary"
              onClick={handleMarkComplete}
              disabled={isCompleting}
              className="px-4"
            >
              {isCompleting ? '...' : '✓'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Legacy export for backward compatibility
/**
 * @deprecated Use VideoCard instead
 */
export const CourseCard = VideoCard; 