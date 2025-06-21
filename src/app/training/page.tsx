'use client';

import { 
  Play, 
  Clock, 
  Users, 
  CheckCircle, 
  Trophy, 
  Star,
  BookOpen,
  Award,
  TrendingUp,
  Target,
  Zap,
  Heart
} from 'lucide-react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { useTrainingVideos, useVideoProgress } from '@/hooks/queries/useTraining';
import { useState } from 'react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  lessons: number;
  progress?: number;
  isEnrolled: boolean;
  instructor: string;
  rating: number;
  ratingCount: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface StatCardProps {
  number: string;
  label: string;
  icon: React.ElementType;
}

function StatCard({ number, label, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white/15 backdrop-blur-lg p-4 md:p-6 rounded-xl text-center text-white">
      <Icon className="w-8 h-8 mx-auto mb-3 opacity-90" />
      <div className="text-2xl md:text-3xl font-bold">{number}</div>
      <div className="text-sm opacity-90 mt-1">{label}</div>
    </div>
  );
}

function CategoryTab({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
        ${isActive 
          ? 'bg-action-purple text-white shadow-lg' 
          : 'bg-bg-soft text-text-secondary hover:bg-white hover:shadow-sm'
        }
      `}
    >
      {label}
    </button>
  );
}

function CourseCard({ 
  id, 
  title, 
  description, 
  thumbnail, 
  duration, 
  lessons, 
  progress, 
  isEnrolled, 
  instructor,
  rating,
  ratingCount,
  level 
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-action-purple to-action-coral overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl">🎓</div>
        </div>
        
        {/* Progress indicator */}
        {isEnrolled && progress !== undefined && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-action-green" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {duration}
        </div>

        {/* Play button (appears on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-action-purple ml-1" />
          </div>
        </div>

        {/* Progress bar at bottom */}
        {isEnrolled && progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full bg-action-green transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Level badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${level === 'Beginner' ? 'bg-green-100 text-green-700' : 
              level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'}
          `}>
            {level}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-action-golden fill-current" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-sm text-text-light">({ratingCount})</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-text-primary mb-2 line-clamp-2">{title}</h3>
        
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{description}</p>

        {/* Instructor */}
        <div className="flex items-center space-x-2 mb-4 text-sm text-text-light">
          <div className="w-6 h-6 bg-action-teal rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">{instructor[0]}</span>
          </div>
          <span>by {instructor}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-text-light mb-6">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{lessons} lessons</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Action button */}
        <button className={`
          w-full py-3 rounded-xl font-medium transition-all duration-300
          ${isEnrolled 
            ? 'bg-action-green text-white hover:bg-green-500 shadow-green' 
            : 'bg-action-purple text-white hover:bg-purple-500 shadow-purple'
          }
        `}>
          {isEnrolled 
            ? (progress === 100 ? 'Review Course' : 'Continue Learning') 
            : 'Start Learning'
          }
        </button>
      </div>
    </div>
  );
}

function LearningPathStep({ 
  stepNumber, 
  title, 
  duration, 
  isCompleted, 
  isCurrent, 
  isLocked 
}: {
  stepNumber: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}) {
  return (
    <div className={`
      flex items-center space-x-4 p-4 rounded-xl transition-all duration-300
      ${isCurrent ? 'bg-action-purple/10 border-2 border-action-purple/30' : 
        isCompleted ? 'bg-action-green/10' : 
        isLocked ? 'bg-gray-50 opacity-60' : 'bg-gray-50 hover:bg-gray-100'}
    `}>
      {/* Step indicator */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center font-semibold
        ${isCompleted ? 'bg-action-green text-white' : 
          isCurrent ? 'bg-action-purple text-white' : 
          isLocked ? 'bg-gray-300 text-gray-500' : 'bg-white border-2 border-gray-300 text-gray-600'}
      `}>
        {isCompleted ? <CheckCircle className="w-6 h-6" /> : stepNumber}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className={`font-semibold mb-1 ${isLocked ? 'text-gray-400' : 'text-text-primary'}`}>
          {title}
        </h4>
        <div className="flex items-center space-x-4 text-sm text-text-light">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          {isCurrent && (
            <span className="bg-action-purple text-white px-2 py-1 rounded-full text-xs font-medium">
              Current
            </span>
          )}
          {isCompleted && (
            <span className="bg-action-green text-white px-2 py-1 rounded-full text-xs font-medium">
              Complete
            </span>
          )}
        </div>
      </div>

      {/* Action button */}
      <div>
        {!isLocked && (
          <button className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-300
            ${isCompleted ? 'bg-action-green/20 text-action-green hover:bg-action-green/30' : 
              isCurrent ? 'bg-action-purple text-white hover:bg-purple-500' : 
              'bg-gray-200 text-gray-600 hover:bg-gray-300'}
          `}>
            {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function TrainingPage() {
  const [activeCategory, setActiveCategory] = useState('All Courses');
  
  // Use real API data instead of sample data
  const { data: coursesData, isLoading, error } = useTrainingVideos();
  const { data: progressData } = useVideoProgress();

  // Transform API data to component format
  const courses = coursesData?.courses || [];
  const transformedCourses: CourseCardProps[] = courses.map((course: any) => {
    // Calculate total lessons and progress
    const totalLessons = course.modules.reduce((total: number, module: any) => 
      total + module.lessons.length, 0
    );
    
    const completedLessons = course.modules.reduce((total: number, module: any) => 
      total + module.lessons.filter((lesson: any) => lesson.progress?.completed).length, 0
    );
    
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Calculate total duration
    const totalSeconds = course.modules.reduce((total: number, module: any) => 
      total + module.lessons.reduce((moduleTotal: number, lesson: any) => 
        moduleTotal + (lesson.duration_seconds || 0), 0
      ), 0
    );
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    return {
      id: course.id,
      title: course.title,
      description: course.description || 'Learn essential skills for network marketing success.',
      thumbnail: course.thumbnail_url || '',
      duration,
      lessons: totalLessons,
      progress: completedLessons > 0 ? progress : undefined,
      isEnrolled: completedLessons > 0 || course.modules.some((m: any) => 
        m.lessons.some((l: any) => l.progress)
      ),
      instructor: 'Expert Trainer', // Could be added to database later
      rating: 4.8, // Could be added to database later
      ratingCount: 150, // Could be added to database later
      level: totalLessons <= 5 ? 'Beginner' : totalLessons <= 15 ? 'Intermediate' : 'Advanced'
    };
  });

  // Calculate stats from real data  
  const stats = {
    coursesCompleted: progressData?.filter((p: any) => p.completed).length?.toString() || '0',
    totalHours: Math.floor((progressData?.reduce((total: number, p: any) => total + (p.progressSeconds || 0), 0) || 0) / 3600).toString(),
    currentStreak: '7', // TODO: Calculate actual streak from database
    achievements: coursesData?.completedLessons?.toString() || '0'
  };

  const categories = ['All Courses', 'Getting Started', 'Core Principles', 'Advanced Training'];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen gradient-dawn pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-text-secondary">Loading courses...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen gradient-dawn pb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-xl text-text-secondary mb-4">Failed to load courses</div>
              <p className="text-text-light">{error.message}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen gradient-dawn pb-6">
        {/* Hero Section with Stats */}
        <div className="bg-gradient-to-r from-action-purple to-action-golden text-white mb-8">
          <div className="px-6 py-8 md:py-12">
            <div className="max-w-7xl mx-auto">
              {/* Header content */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Training Academy</h1>
                <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                  Unlock your potential with world-class training designed for network marketing success
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <StatCard number={stats.coursesCompleted} label="Lessons Completed" icon={BookOpen} />
                <StatCard number={stats.totalHours} label="Hours Learned" icon={Clock} />
                <StatCard number={stats.currentStreak} label="Day Streak" icon={TrendingUp} />
                <StatCard number={stats.achievements} label="Total Lessons" icon={Award} />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button className="bg-white text-action-purple px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Browse Courses
                </button>
                <button className="bg-white/20 border-2 border-white text-white px-8 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors">
                  View My Progress
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Course Categories */}
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-8">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <CategoryTab
                  key={category}
                  label={category}
                  isActive={category === activeCategory}
                  onClick={() => setActiveCategory(category)}
                />
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                {transformedCourses.length > 0 ? 'Your Courses' : 'No Courses Available'}
              </h2>
              {transformedCourses.length > 0 && (
                <button className="text-action-purple font-medium hover:text-purple-600 transition-colors flex items-center gap-2">
                  View All
                  <Target className="w-4 h-4" />
                </button>
              )}
            </div>

            {transformedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {transformedCourses.map((course) => (
                  <CourseCard key={course.id} {...course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">No courses available yet</h3>
                <p className="text-text-secondary">Check back soon for new training content!</p>
              </div>
            )}
          </div>

          {/* Learning Path Section - Show only if courses exist */}
          {transformedCourses.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-action-purple to-action-coral rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Your Learning Path</h3>
                  <p className="text-text-secondary">Complete this structured path to become a network marketing expert</p>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-3xl font-bold text-action-purple">
                    {coursesData?.overallProgress || 0}%
                  </div>
                  <div className="text-sm text-text-light">Complete</div>
                </div>
              </div>

              <div className="space-y-0">
                <LearningPathStep
                  stepNumber={1}
                  title="Foundation Basics"
                  duration="2 hours"
                  isCompleted={true}
                  isCurrent={false}
                  isLocked={false}
                />
                <LearningPathStep
                  stepNumber={2}
                  title="Building Relationships"
                  duration="3 hours"
                  isCompleted={true}
                  isCurrent={false}
                  isLocked={false}
                />
                <LearningPathStep
                  stepNumber={3}
                  title="Advanced Sales Techniques"
                  duration="4 hours"
                  isCompleted={false}
                  isCurrent={true}
                  isLocked={false}
                />
                <LearningPathStep
                  stepNumber={4}
                  title="Leadership Development"
                  duration="5 hours"
                  isCompleted={false}
                  isCurrent={false}
                  isLocked={false}
                />
                <LearningPathStep
                  stepNumber={5}
                  title="Business Scaling"
                  duration="3 hours"
                  isCompleted={false}
                  isCurrent={false}
                  isLocked={true}
                />
              </div>
            </div>
          )}

          {/* Achievement Showcase */}
          {(coursesData?.completedLessons || 0) > 0 && (
            <div className="bg-gradient-to-r from-action-golden to-yellow-400 rounded-2xl p-6 md:p-8 text-center text-white">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-lg opacity-90 mb-6">
                You've completed {coursesData?.completedLessons} lessons! Keep up the amazing work!
              </p>
              <button className="bg-white text-action-golden px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                View All Achievements
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 