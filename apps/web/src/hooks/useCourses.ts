'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, Course, CreateCourseDto, UpdateCourseDto, EnrollmentResponse } from '@/lib/api';

// Query keys for consistency
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  userCourses: (userId: string) => [...courseKeys.all, 'user', userId] as const,
  enrolled: () => [...courseKeys.all, 'enrolled'] as const,
};

// Get all courses
export const useCourses = () => {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: async (): Promise<Course[]> => {
      const { data } = await apiClient.get('/dashboard/courses');
      return data;
    },
  });
};

// Get enrolled courses for student
export const useEnrolledCourses = () => {
  return useQuery({
    queryKey: courseKeys.enrolled(),
    queryFn: async (): Promise<Course[]> => {
      const { data } = await apiClient.get('/courses/enrolled');
      return data;
    },
  });
};

// Get courses for a specific user
export const useUserCourses = (userId: string) => {
  return useQuery({
    queryKey: courseKeys.userCourses(userId),
    queryFn: async (): Promise<Course[]> => {
      const { data } = await apiClient.get(`/dashboard/courses/user/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

// Get course by ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: async (): Promise<Course> => {
      const { data } = await apiClient.get(`/dashboard/courses/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: CreateCourseDto): Promise<Course> => {
      const { data } = await apiClient.post('/dashboard/courses', courseData);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

// Update course mutation
export const useUpdateCourse = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: UpdateCourseDto): Promise<Course> => {
      const { data } = await apiClient.put(`/dashboard/courses/${id}`, courseData);
      return data;
    },
    onSuccess: () => {
      // Invalidate specific course and courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

// Delete course mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/dashboard/courses/${id}`);
    },
    onSuccess: () => {
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

// Enroll in course mutation
export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string): Promise<EnrollmentResponse> => {
      const { data } = await apiClient.post(`/dashboard/courses/${courseId}/enroll`);
      return data;
    },
    onSuccess: (_, courseId) => {
      // Invalidate user courses and specific course
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

// Unenroll from course mutation (for students)
export const useUnenrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string): Promise<void> => {
      await apiClient.delete(`/courses/${courseId}/unenroll`);
    },
    onSuccess: () => {
      // Invalidate enrolled courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.enrolled() });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};