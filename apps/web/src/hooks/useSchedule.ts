'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface ScheduleEvent {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  instructor?: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: string;
  date: Date | string;
  color: string;
  createdAt: Date | string;
  course?: {
    id: string;
    title: string;
    code: string;
    color: string;
  };
}

// Query keys
export const scheduleKeys = {
  all: ['schedule'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...scheduleKeys.lists(), { filters }] as const,
  today: () => [...scheduleKeys.all, 'today'] as const,
  week: (startDate?: string) => [...scheduleKeys.all, 'week', startDate] as const,
  upcoming: (limit?: number) => [...scheduleKeys.all, 'upcoming', limit] as const,
  stats: () => [...scheduleKeys.all, 'stats'] as const,
  course: (courseId: string) => [...scheduleKeys.all, 'course', courseId] as const,
};

// Get all schedule events
export const useScheduleEvents = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: scheduleKeys.list(filters || {}),
    queryFn: async (): Promise<ScheduleEvent[]> => {
      const { data } = await apiClient.get('/schedule', { params: filters });
      return data;
    },
  });
};

// Get today's schedule
export const useTodaySchedule = () => {
  return useQuery({
    queryKey: scheduleKeys.today(),
    queryFn: async (): Promise<ScheduleEvent[]> => {
      const { data } = await apiClient.get('/schedule/today');
      return data;
    },
  });
};

// Get week schedule
export const useWeekSchedule = (startDate?: string) => {
  return useQuery({
    queryKey: scheduleKeys.week(startDate),
    queryFn: async (): Promise<ScheduleEvent[]> => {
      const { data} = await apiClient.get('/schedule/week', {
        params: startDate ? { startDate } : undefined
      });
      return data;
    },
  });
};

// Get upcoming events
export const useUpcomingScheduleEvents = (limit: number = 10) => {
  return useQuery({
    queryKey: scheduleKeys.upcoming(limit),
    queryFn: async (): Promise<ScheduleEvent[]> => {
      const { data } = await apiClient.get('/schedule/upcoming', { params: { limit } });
      return data;
    },
  });
};

// Get schedule stats
export const useScheduleStats = () => {
  return useQuery({
    queryKey: scheduleKeys.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get('/schedule/stats');
      return data;
    },
  });
};

// Get course schedule
export const useCourseSchedule = (courseId: string) => {
  return useQuery({
    queryKey: scheduleKeys.course(courseId),
    queryFn: async (): Promise<ScheduleEvent[]> => {
      const { data } = await apiClient.get(`/schedule/course/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });
};

// Create schedule event
export const useCreateScheduleEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: Partial<ScheduleEvent>) => {
      const { data } = await apiClient.post('/schedule', eventData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
};

// Update schedule event
export const useUpdateScheduleEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<ScheduleEvent> & { id: string }) => {
      const { data } = await apiClient.patch(`/schedule/${id}`, eventData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
};

// Delete schedule event
export const useDeleteScheduleEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/schedule/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
};
