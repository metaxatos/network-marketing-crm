'use client';

import { useEffect } from 'react';
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
import { useTrainingStore } from '@/stores/training-store';

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
            : 'Enroll Now'
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
    <div className="flex items-center gap-6 p-5 relative">
      {/* Connection line */}
      <div className="absolute left-7 top-16 w-0.5 h-16 bg-gray-200"></div>
      
      {/* Step indicator */}
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center font-bold relative z-10
        ${isCompleted ? 'bg-action-green text-white' :
          isCurrent ? 'bg-action-purple text-white shadow-lg shadow-purple-300' :
          'bg-gray-100 text-gray-400'}
      `}>
        {isCompleted ? <CheckCircle className="w-6 h-6" /> : stepNumber}
      </div>

      {/* Step content */}
      <div className="flex-1">
        <h4 className="font-semibold text-text-primary mb-1">{title}</h4>
        <p className="text-sm text-text-light">{duration}</p>
      </div>

      {/* Action button */}
      <button className={`
        px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
        ${isCompleted ? 'bg-action-green text-white' :
          isCurrent ? 'bg-action-purple text-white hover:bg-purple-500' :
          isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
          'bg-gray-100 text-gray-600 hover:bg-gray-200'}
      `}>
        {isCompleted ? 'Completed' : 
         isCurrent ? 'Continue' : 
         isLocked ? 'Locked' : 'Start'}
      </button>
    </div>
  );
}

export default function TrainingPage() {
  const { courses, fetchCourses } = useTrainingStore();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Sample data - replace with real data from store
  const stats = {
    coursesCompleted: '12',
    totalHours: '45',
    currentStreak: '7',
    achievements: '23'
  };

  const categories = ['All Courses', 'Getting Started', 'Sales Training', 'Leadership', 'Marketing', 'Team Building'];
  const activeCategory = 'All Courses';

  const sampleCourses: CourseCardProps[] = [
    {
      id: '1',
      title: 'Network Marketing Fundamentals',
      description: 'Master the basics of network marketing and build a solid foundation for your business success.',
      thumbnail: '',
      duration: '2h 30m',
      lessons: 12,
      progress: 75,
      isEnrolled: true,
      instructor: 'Sarah Johnson',
      rating: 4.8,
      ratingCount: 234,
      level: 'Beginner'
    },
    {
      id: '2',
      title: 'Advanced Sales Strategies',
      description: 'Learn proven sales techniques and closing strategies that top performers use to maximize their results.',
      thumbnail: '',
      duration: '3h 15m',
      lessons: 18,
      progress: 30,
      isEnrolled: true,
      instructor: 'Mike Chen',
      rating: 4.9,
      ratingCount: 187,
      level: 'Advanced'
    },
    {
      id: '3',
      title: 'Building Your Team',
      description: 'Discover how to recruit, train, and motivate a high-performing team that drives exponential growth.',
      thumbnail: '',
      duration: '4h 20m',
      lessons: 24,
      isEnrolled: false,
      instructor: 'Lisa Rodriguez',
      rating: 4.7,
      ratingCount: 156,
      level: 'Intermediate'
    },
    {
      id: '4',
      title: 'Digital Marketing Mastery',
      description: 'Leverage social media and digital tools to build your brand and attract qualified prospects online.',
      thumbnail: '',
      duration: '3h 45m',
      lessons: 20,
      isEnrolled: false,
      instructor: 'David Kim',
      rating: 4.6,
      ratingCount: 203,
      level: 'Intermediate'
    }
  ];

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
                <StatCard number={stats.coursesCompleted} label="Courses Completed" icon={BookOpen} />
                <StatCard number={stats.totalHours} label="Hours Learned" icon={Clock} />
                <StatCard number={stats.currentStreak} label="Day Streak" icon={TrendingUp} />
                <StatCard number={stats.achievements} label="Achievements" icon={Award} />
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
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Featured Courses</h2>
              <button className="text-action-purple font-medium hover:text-purple-600 transition-colors flex items-center gap-2">
                View All
                <Target className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sampleCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          </div>

          {/* Learning Path Section */}
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
                <div className="text-3xl font-bold text-action-purple">65%</div>
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

          {/* Achievement Showcase */}
          <div className="bg-gradient-to-r from-action-golden to-yellow-400 rounded-2xl p-6 md:p-8 text-center text-white">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="text-lg opacity-90 mb-6">You've completed 3 courses this month. Keep up the amazing work!</p>
            <button className="bg-white text-action-golden px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              View All Achievements
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 