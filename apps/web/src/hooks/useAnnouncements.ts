'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'GENERAL' | 'ASSIGNMENT' | 'EVENT' | 'GRADE' | 'URGENT';
  courseId?: string;
  authorId: string;
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    code: string;
    color: string;
  };
  author?: {
    id: string;
    email: string;
  };
  isRead?: boolean;
}

// Query keys
export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...announcementKeys.lists(), { filters }] as const,
  recent: (limit?: number) => [...announcementKeys.all, 'recent', limit] as const,
  stats: () => [...announcementKeys.all, 'stats'] as const,
  unreadCount: () => [...announcementKeys.all, 'unread-count'] as const,
  course: (courseId: string) => [...announcementKeys.all, 'course', courseId] as const,
};

// Get all announcements
export const useAnnouncements = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: announcementKeys.list(filters || {}),
    queryFn: async (): Promise<Announcement[]> => {
      const { data } = await apiClient.get('/announcements', { params: filters });
      return data;
    },
  });
};

// Get recent announcements
export const useRecentAnnouncements = (limit: number = 10) => {
  return useQuery({
    queryKey: announcementKeys.recent(limit),
    queryFn: async (): Promise<Announcement[]> => {
      const { data } = await apiClient.get('/announcements/recent', { params: { limit } });
      return data;
    },
  });
};

// Get unread count
export const useUnreadAnnouncementsCount = () => {
  return useQuery({
    queryKey: announcementKeys.unreadCount(),
    queryFn: async (): Promise<{ count: number }> => {
      const { data } = await apiClient.get('/announcements/unread-count');
      return data;
    },
  });
};

// Get announcement stats
export const useAnnouncementStats = () => {
  return useQuery({
    queryKey: announcementKeys.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get('/announcements/stats');
      return data;
    },
  });
};

// Get course announcements
export const useCourseAnnouncements = (courseId: string) => {
  return useQuery({
    queryKey: announcementKeys.course(courseId),
    queryFn: async (): Promise<Announcement[]> => {
      const { data } = await apiClient.get(`/announcements/course/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });
};

// Mark announcement as read
export const useMarkAnnouncementRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const { data } = await apiClient.post(`/announcements/${announcementId}/mark-read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
};

// Create announcement (for instructors)
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementData: Partial<Announcement>) => {
      const { data } = await apiClient.post('/announcements', announcementData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
};
