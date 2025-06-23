'use client'

import { useAppAuth } from '@/hooks/useAuth'
import { useDashboardMetrics, useActivityFeed, useRecentContacts } from '@/hooks/queries/useDashboard'
import { useContacts } from '@/hooks/queries/useContacts'
import { useEmailHistory } from '@/hooks/queries/useEmails'
import { useTrainingVideos, useVideoProgress } from '@/hooks/queries/useTraining'
import { useDashboardRealtime, useRealtimeConnection } from '@/hooks/useRealtime'
import { useContactsRealtime } from '@/hooks/useContactsRealtime'
import { useTranslation } from '@/hooks/useTranslation'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { RealtimeTestPanel } from '@/components/dev/RealtimeTestPanel'
import { ErrorBoundary, QueryErrorFallback } from '@/components/ErrorBoundary'
// import DashboardSkeleton from '@/components/Dashboard/DashboardSkeleton'
import { 
  WelcomeCard, 
  ActionCard, 
  ProgressRing, 
  TeamActivityFeed, 
  StatsBubble,
  SmartSuggestion,
  QuickWins,
  EmailAnalyticsWidget
} from '@/components/Dashboard'
import { QuickEmailActions } from '@/components/Dashboard/QuickEmailActions'
import { 
  Users, 
  Mail, 
  Calendar, 
  GraduationCap, 
  BarChart3, 
  Globe,
  Target,
  Award
} from 'lucide-react'
import { useMemo } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAppAuth()
  const { t } = useTranslation()
  
  // React Query hooks for server state
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics()
  const { data: activitiesData, isLoading: activitiesLoading } = useActivityFeed()
  const { data: contacts = [], isLoading: contactsLoading } = useContacts()
  const { data: sentEmails = [], isLoading: emailsLoading } = useEmailHistory()
  const { data: courses = [], isLoading: coursesLoading } = useTrainingVideos()
  const { data: userProgress = [], isLoading: progressLoading } = useVideoProgress()
  
  // Extract activities from InfiniteData if needed
  const activities = Array.isArray(activitiesData) 
    ? activitiesData 
    : activitiesData?.pages?.flatMap(page => page.activities) ?? []
  
  // Realtime dashboard updates
  const { contactCount, emailCount, activityCount } = useDashboardRealtime()
  const { isConnected, isReconnecting } = useRealtimeConnection()
  
  // Set up realtime subscriptions for contacts
  useContactsRealtime()

  if (loading) {
    return (
      <div className="min-h-screen gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
          <h2 className="mt-6 text-xl font-semibold text-gray-700">{t('common.loading')}</h2>
        </div>
      </div>
    )
  }

  const displayName = user?.user_metadata?.first_name || 'Champion'

  // Calculate progress metrics (use realtime data when available, then React Query data, then fallbacks)
  const contactsThisWeek = contactCount ?? metrics?.contactsThisWeek ?? contacts.length
  const emailsToday = emailCount ?? metrics?.emailsToday ?? sentEmails.filter((email: any) => {
    const today = new Date().toDateString()
    return email.sent_at && new Date(email.sent_at).toDateString() === today
  }).length
  
  // Calculate real training progress from user progress
  const trainingProgress = useMemo(() => {
    if (progressLoading || coursesLoading) return 0
    const coursesArray = Array.isArray(courses) ? courses : courses?.courses || []
    if (coursesArray.length === 0) return 0
    
    const completedCount = userProgress.filter((progress: any) => progress.completed).length
    return Math.round((completedCount / coursesArray.length) * 100)
  }, [userProgress, courses, progressLoading, coursesLoading])

  // Quick wins actions based on real data
  const quickWinActions = useMemo(() => {
    const actions = []
    const coursesArray = Array.isArray(courses) ? courses : courses?.courses || []
    
    // Show training action if there are incomplete courses
    if (coursesArray.length > 0 && trainingProgress < 100) {
      actions.push({
        title: t('training.continueCourse'),
        subtitle: t('training.progress', { percent: trainingProgress }),
        href: "/training",
        icon: <GraduationCap className="w-full h-full" />,
        variant: "golden" as const
      })
    }
    
    // Show team action if user has contacts
    if (contacts.length > 0) {
      actions.push({
        title: t('team.title'),
        subtitle: t('dashboard.recentActivity'),
        href: "/team",
        icon: <BarChart3 className="w-full h-full" />,
        variant: "green" as const
      })
    }
    
    // Always show landing page action
    actions.push({
      title: t('dashboard.updateLandingPage'),
      subtitle: t('dashboard.makeItShine'),
      href: "/landing-page",
      icon: <Globe className="w-full h-full" />,
      variant: "blue" as const
    })
    
    return actions
  }, [courses, trainingProgress, contacts, t])

  // Calculate monthly goals progress based on real data
  const monthlyGoalProgress = Math.min(Math.round((contactsThisWeek / 20) * 100), 100)

  // Show loading state if any critical data is still loading
  const isDataLoading = metricsLoading || contactsLoading

  // Generate smart suggestion based on real data
  const smartSuggestion = useMemo(() => {
    // Check for recent unopened emails
    const recentEmails = sentEmails.filter((email: any) => {
      const sentDate = new Date(email.sent_at)
      const daysSince = (Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince <= 3 && !email.opened
    })
    
    if (recentEmails.length > 0) {
      return {
        text: `You have ${recentEmails.length} recent email${recentEmails.length > 1 ? 's' : ''} that haven't been opened yet - consider following up!`,
        actionText: "Review Emails",
        actionUrl: "/emails"
      }
    }
    
    // Check for prospects that need follow-up
    const prospects = contacts.filter((contact: any) => contact.status === 'prospect')
    if (prospects.length > 0) {
      return {
        text: `You have ${prospects.length} prospect${prospects.length > 1 ? 's' : ''} ready for follow-up!`,
        actionText: "View Prospects",
        actionUrl: "/contacts?filter=prospects"
      }
    }
    
    // Check if user needs training
    const coursesArray = Array.isArray(courses) ? courses : courses?.courses || []
    if (coursesArray.length > 0 && trainingProgress < 50) {
      return {
        text: "Complete your training to unlock more features and maximize your success!",
        actionText: "Continue Training",
        actionUrl: "/training"
      }
    }
    
    return null
  }, [sentEmails, contacts, courses, trainingProgress])

  return (
    <ErrorBoundary fallback={({ error, resetError }) => <QueryErrorFallback error={error} resetError={resetError} />}>
      <div className="min-h-screen gradient-main">
        <DashboardLayout user={user || undefined}>
          <div className="pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto">
            
            {/* Welcome Card */}
            <WelcomeCard userName={displayName} streak={7} />
            
            {/* Connection Status Indicator */}
            {isReconnecting && (
              <div className="mx-4 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{t('dashboard.reconnecting')}</span>
                </div>
              </div>
            )}
            
            {!isConnected && !isReconnecting && (
              <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm font-medium">{t('dashboard.liveUpdatesUnavailable')}</span>
                </div>
              </div>
            )}

            {/* Loading state for key metrics */}
            {isDataLoading && (
              <div className="mx-4 mb-6">
                <div className="flex items-center gap-2 text-text-secondary">
                  <div className="w-4 h-4 bg-gray-200 rounded-full animate-shimmer"></div>
                  <span className="text-sm">{t('dashboard.loadingDashboard')}</span>
                </div>
              </div>
            )}

            {/* Quick Stats Row - Mobile */}
            <div className="grid grid-cols-3 gap-3 mx-4 mb-6 md:hidden">
              <StatsBubble 
                number={isDataLoading ? "..." : contactsThisWeek.toString()} 
                label={t('contacts.title')} 
                trend="up" 
                trendValue="+3" 
                color="teal" 
              />
              <StatsBubble 
                number={isDataLoading ? "..." : emailsToday.toString()} 
                label={t('nav.emails')} 
                trend="up" 
                trendValue="+2" 
                color="green" 
              />
              <StatsBubble 
                number={isDataLoading ? "..." : (activityCount ?? activities.length).toString()} 
                label={t('dashboard.activities')} 
                trend="neutral" 
                color="purple" 
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-4 md:mx-0">
              
              {/* Left Column - New Layout (Mobile: full width, Desktop: 2/3) */}
              <div className="lg:col-span-2">
                <div className="bg-glass rounded-xl p-6 space-y-6">
                  {/* Primary Actions Section */}
                  <section className="primary-actions">
                    <h2 className="font-display text-xl font-semibold text-text-primary mb-6">
                      {t('dashboard.quickActions')}
                    </h2>
                    
                    <div className="action-cards-grid grid grid-cols-1 md:grid-cols-3 gap-5">
                      <ActionCard
                        title={t('dashboard.sendEmail')}
                        subtitle={t('dashboard.stayInTouch')}
                        href="/emails"
                        icon={<Mail className="w-full h-full" />}
                        variant="coral"
                        isPrimary={true}
                      />
                      
                      <ActionCard
                        title={t('dashboard.myContacts')}
                        subtitle={contactsLoading ? t('common.loading') : t('dashboard.contactsCount', { count: contacts.length })}
                        href="/contacts"
                        icon={<Users className="w-full h-full" />}
                        variant="teal"
                        isPrimary={true}
                      />
                      
                      <ActionCard
                        title={t('events.title')}
                        subtitle={t('dashboard.scheduleMeetings')}
                        href="/events"
                        icon={<Calendar className="w-full h-full" />}
                        variant="purple"
                        isPrimary={true}
                      />
                    </div>
                  </section>
                  
                  {/* Quick Email Actions - Phase 2 Feature */}
                  <QuickEmailActions className="mt-8" />
                  
                  {/* Smart Suggestion Section - Only show if we have a real suggestion */}
                  {smartSuggestion && (
                    <SmartSuggestion
                      suggestion={smartSuggestion.text}
                      actionText={smartSuggestion.actionText}
                      onAction={() => window.location.href = smartSuggestion.actionUrl}
                    />
                  )}
                  
                  {/* Quick Wins Section - Only show if we have actions */}
                  {quickWinActions.length > 0 && (
                    <QuickWins actions={quickWinActions} />
                  )}
                </div>
              </div>

              {/* Right Column - Progress & Activity (Mobile: full width, Desktop: 1/3) */}
              <div className="space-y-6">
                
                {/* Quick Stats - Desktop Only */}
                <div className="hidden md:grid grid-cols-1 gap-4">
                  <StatsBubble 
                    number={isDataLoading ? "..." : contactsThisWeek.toString()} 
                    label="Contacts This Week" 
                    trend="up" 
                    trendValue="+3" 
                    color="teal" 
                  />
                  <StatsBubble 
                    number={isDataLoading ? "..." : emailsToday.toString()} 
                    label="Emails Sent" 
                    trend="up" 
                    trendValue="+2" 
                    color="green" 
                  />
                  <StatsBubble 
                    number={activitiesLoading ? "..." : activities.length.toString()} 
                    label="Recent Activities" 
                    trend="neutral" 
                    color="purple" 
                  />
                </div>

                {/* Progress Section */}
                <div className="bg-glass rounded-xl p-6 shadow-md">
                  <h3 className="font-display text-lg font-semibold text-text-primary mb-6">
                    Your Progress
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <ProgressRing 
                      percentage={isDataLoading ? 0 : monthlyGoalProgress} 
                      label="Monthly Goals" 
                      size={80}
                    />
                    <ProgressRing 
                      percentage={progressLoading ? 0 : trainingProgress} 
                      label="Training Complete" 
                      size={80}
                      showCelebration={trainingProgress === 100}
                    />
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-action-purple">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-action-purple" />
                      <span className="text-sm font-medium text-text-primary">Next Milestone</span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {isDataLoading ? "Loading goal progress..." : `${Math.max(0, 20 - contactsThisWeek)} more contacts to reach your monthly goal! 🎯`}
                    </p>
                  </div>
                </div>

                {/* Email Analytics Widget */}
                <EmailAnalyticsWidget />

                {/* Team Activity Feed - Desktop Only */}
                <div className="hidden lg:block">
                  <TeamActivityFeed />
                </div>

                {/* Encouragement Card */}
                <div className="bg-gradient-to-br from-action-golden to-yellow-400 text-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">You're doing great!</h3>
                      <p className="text-sm opacity-90">Keep up the momentum</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-95">
                    You've made amazing progress this week. Every connection counts towards your success! 🌟
                  </p>
                </div>
              </div>
            </div>

            {/* Team Activity Feed - Mobile Only */}
            <div className="block lg:hidden mx-4 mt-6">
              <TeamActivityFeed />
            </div>
          </div>
          </div>
        </DashboardLayout>
        
        {/* Realtime Debug Panel - Available in all environments */}
        <RealtimeTestPanel />
      </div>
    </ErrorBoundary>
  )
} 