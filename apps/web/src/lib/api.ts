import axios from 'axios';

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Prefer the API's error message over axios' generic one
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}

// Types for Course API
export interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
  instructor: string | {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  color: string;
  credits: number;
  semester: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  title: string;
  code: string;
  description?: string;
  instructor: string;
  color?: string;
  credits?: number;
  semester: string;
}

export interface UpdateCourseDto {
  title?: string;
  code?: string;
  description?: string;
  instructor?: string;
  color?: string;
  credits?: number;
  semester?: string;
}

export interface EnrollmentResponse {
  message: string;
  enrollment?: {
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: string;
  };
}

// Types for Task API
export interface Task {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  type: string;
  progress: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
  course?: {
    title: string;
    color: string;
    code: string;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  courseId?: string;
  dueDate: string;
  dueTime?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  type?: string;
  estimatedTime?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  type?: string;
  progress?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  estimatedTime?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  highPriority: number;
}

// Export alias for convenience
export const api = apiClient;