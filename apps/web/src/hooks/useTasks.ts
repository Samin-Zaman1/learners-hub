'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, Task, CreateTaskDto, UpdateTaskDto, TaskStats } from '@/lib/api';

// Query keys for consistency
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
  upcoming: () => [...taskKeys.all, 'upcoming'] as const,
};

// Get all tasks
export const useTasks = (status?: string, priority?: string) => {
  return useQuery({
    queryKey: taskKeys.list({ status, priority }),
    queryFn: async (): Promise<Task[]> => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      
      const { data } = await apiClient.get(`/dashboard/tasks?${params.toString()}`);
      return data;
    },
  });
};

// Get upcoming tasks
export const useUpcomingTasks = () => {
  return useQuery({
    queryKey: taskKeys.upcoming(),
    queryFn: async (): Promise<Task[]> => {
      const { data } = await apiClient.get('/dashboard/tasks/upcoming');
      return data;
    },
  });
};

// Get task statistics
export const useTaskStats = () => {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: async (): Promise<TaskStats> => {
      const { data } = await apiClient.get('/dashboard/tasks/stats');
      return data;
    },
  });
};

// Get task by ID
export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async (): Promise<Task> => {
      const { data } = await apiClient.get(`/dashboard/tasks/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskDto): Promise<Task> => {
      const { data } = await apiClient.post('/dashboard/tasks', taskData);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

// Update task mutation
export const useUpdateTask = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: UpdateTaskDto): Promise<Task> => {
      const { data } = await apiClient.put(`/dashboard/tasks/${id}`, taskData);
      return data;
    },
    onSuccess: () => {
      // Invalidate specific task and lists
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

// Update task status (quick action)
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }): Promise<Task> => {
      const { data } = await apiClient.put(`/dashboard/tasks/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

// Update task progress (quick action)
export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }): Promise<Task> => {
      const { data } = await apiClient.put(`/dashboard/tasks/${id}/progress`, { progress });
      return data;
    },
    onSuccess: () => {
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

// Delete task mutation
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/dashboard/tasks/${id}`);
    },
    onSuccess: () => {
      // Invalidate task lists
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};