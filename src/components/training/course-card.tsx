'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, CheckCircle } from 'lucide-react';
import type { Course } from '@/types/training';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTrainingStore } from '@/stores/training-store';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { enrollInCourse } = useTrainingStore();

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    await enrollInCourse(course.id);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🎓</div>
          </div>
        )}
        
        {/* Progress indicator */}
        {course.progress && course.enrollment && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success-600" />
              <span className="text-sm font-medium">{course.progress.progressPercentage}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
        
        {course.description && (
          <p className="text-gray-600 line-clamp-2">{course.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {course.progress && (
            <>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.progress.totalLessons} lessons</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.progress.totalDuration)}</span>
              </div>
            </>
          )}
        </div>

        {/* Action */}
        {course.enrollment ? (
          <Link href={`/dashboard/training/course/${course.id}`}>
            <Button className="w-full">
              {course.progress?.completedLessons === course.progress?.totalLessons 
                ? 'Review Course' 
                : 'Continue Learning'}
            </Button>
          </Link>
        ) : (
          <Button onClick={handleEnroll} className="w-full">
            Enroll Now
          </Button>
        )}
      </div>
    </div>
  );
} 