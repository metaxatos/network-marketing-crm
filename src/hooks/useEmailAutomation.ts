import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

interface TriggerWelcomeParams {
  memberId: string;
}

interface TriggerRankAchievementParams {
  memberId: string;
  rankName: string;
  nextRankName?: string;
}

interface AutomationStatus {
  automations: any[];
  summary: {
    pending: number;
    sent: number;
    failed: number;
    total: number;
  };
}

export function useTriggerWelcomeEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ memberId }: TriggerWelcomeParams) => {
      const response = await fetch('/api/automation/trigger-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to trigger welcome email');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailAutomation });
    },
  });
}

export function useTriggerRankAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ memberId, rankName, nextRankName }: TriggerRankAchievementParams) => {
      const response = await fetch('/api/automation/trigger-rank-achievement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, rankName, nextRankName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to trigger rank achievement email');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailAutomation });
    },
  });
}

export function useAutomationStatus(status?: string) {
  return useQuery<AutomationStatus>({
    queryKey: queryKeys.automationStatus(status),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }

      const response = await fetch(`/api/automation/status?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch automation status');
      }

      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useTriggerAutomationProcessing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-email-automation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to trigger automation processing');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailAutomation });
    },
  });
} 