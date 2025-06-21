// Email hooks (Phases 2, 3, 4, 5)
export {
  useEmailTemplates,
  useEmailHistory,
  useEmailStats,
  useSendEmail,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  useTemplatesByCategory,
  useQuickActionTemplates,
  useSendQuickEmail,
} from './queries/useEmails';

export {
  useTriggerWelcomeEmail,
  useTriggerRankAchievement,
  useAutomationStatus,
  useTriggerAutomationProcessing,
} from './useEmailAutomation';

// Contact hooks
export {
  useContacts,
  useContactDetail,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useAddContactNote,
  useContactCommunications,
} from './queries/useContacts';

// Training hooks
export {
  useTrainingCourses,
  useTrainingVideos,
  useVideoProgress,
  useVideoProgressById,
  useVideoCategories,
  useUpdateVideoProgress,
  useCompleteVideo,
  useStartWatchingVideo,
} from './queries/useTraining';

// Dashboard hooks
export {
  useDashboardMetrics,
  useActivityFeed,
  useRecentContacts,
  useQuickStats,
  useUpcomingTasks,
  usePerformanceMetrics,
  useGrowthChartData,
} from './queries/useDashboard';

// Realtime hooks
export {
  useRealtimeSubscription,
  useMultipleRealtimeSubscriptions,
  useDashboardRealtime,
  useActivityFeedRealtime,
} from './useRealtime';

// Auth hooks
export {
  useAuth,
  useAppAuth,
} from './useAuth'; 