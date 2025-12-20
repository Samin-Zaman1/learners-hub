'use client';

import { useQuery } from '@tanstack/react-query';
import { ActivityData, SemesterData } from '../components/charts/ActivityChart';
import { apiClient } from '@/lib/api';

// Query keys
export const activityDataKeys = {
  all: ['activityData'] as const,
  weeklyStats: () => [...activityDataKeys.all, 'weekly-stats'] as const,
};

// Fetch weekly activity statistics from API
export const useActivityData = () => {
  return useQuery({
    queryKey: activityDataKeys.weeklyStats(),
    queryFn: async (): Promise<SemesterData[]> => {
      const { data } = await apiClient.get('/activities/weekly-stats');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for page-specific usage
export function useActivityDataForPage(pageType: 'dashboard' | 'analytics') {
  const { data, isLoading, error, refetch } = useActivityData();
  
  // Customize data based on page type
  const getVariantConfig = () => {
    switch (pageType) {
      case 'dashboard':
        return {
          variant: 'full' as const,
          showSummary: true,
          defaultActivities: ['classAttendance', 'quizAttendance', 'assignmentSubmission']
        };
      case 'analytics':
        return {
          variant: 'full' as const,
          showSummary: true,
          defaultActivities: ['classAttendance', 'quizAttendance', 'assignmentSubmission', 'studyHours', 'groupProjects']
        };
      default:
        return {
          variant: 'full' as const,
          showSummary: true,
          defaultActivities: ['classAttendance', 'quizAttendance', 'assignmentSubmission']
        };
    }
  };

  return {
    data: data || [],
    loading: isLoading,
    error: error ? 'Failed to fetch activity data' : null,
    refetch,
    config: getVariantConfig()
  };
}