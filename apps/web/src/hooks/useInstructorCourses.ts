import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

interface Course {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  enrollmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  activeAssignments: number;
  totalAnnouncements: number;
  averageGrade?: number;
}

interface UseInstructorCoursesResult {
  courses: Course[];
  stats: InstructorStats | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInstructorCourses(): UseInstructorCoursesResult {
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: () => apiClient.get('/instructor/courses'),
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['instructor-stats'],
    queryFn: () => apiClient.get('/instructor/stats'),
  });

  const loading = coursesLoading || statsLoading;
  const error = coursesError?.message || statsError?.message || null;
  const courses = coursesData?.data || [];
  const stats = statsData?.data;

  return {
    courses,
    stats,
    loading,
    error,
    refetch: refetchCourses,
  };
}