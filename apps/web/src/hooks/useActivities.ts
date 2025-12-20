'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Activity {
  id: string;
  userId: string;
  type: string;
  description: string;
  metadata?: unknown;
  courseId?: string;
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    code: string;
    color: string;
  };
}

// Query keys
export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...activityKeys.lists(), { filters }] as const,
  recent: (limit?: number) => [...activityKeys.all, 'recent', limit] as const,
  stats: () => [...activityKeys.all, 'stats'] as const,
  course: (courseId: string) => [...activityKeys.all, 'course', courseId] as const,
};

// Get all user activities
export const useActivities = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: activityKeys.list(filters || {}),
    queryFn: async (): Promise<Activity[]> => {
      const { data } = await apiClient.get('/activities', { params: filters });
      return data;
    },
  });
};

// Get recent activities
export const useRecentActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: activityKeys.recent(limit),
    queryFn: async (): Promise<Activity[]> => {
      const { data } = await apiClient.get('/activities/recent', { params: { limit } });
      return data;
    },
  });
};

// Get activity stats
export const useActivityStats = () => {
  return useQuery({
    queryKey: activityKeys.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get('/activities/stats');
      return data;
    },
  });
};

// Get course activities
export const useCourseActivities = (courseId: string) => {
  return useQuery({
    queryKey: activityKeys.course(courseId),
    queryFn: async (): Promise<Activity[]> => {
      const { data } = await apiClient.get(`/activities/course/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });
};

// Create activity
export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityData: Partial<Activity>) => {
      const { data } = await apiClient.post('/activities', activityData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
};
