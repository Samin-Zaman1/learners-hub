'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        const userEmail = localStorage.getItem('userEmail');

        if (!token) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null,
          });
          return;
        }

        // Verify token with backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const response = await axios.get(`${apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.ok && response.data.user) {
          setAuthState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            token,
          });
        } else {
          // Token is invalid, clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null,
          });
        }
      } catch (error) {
        // Token verification failed, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null,
        });
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userEmail', userData.email);
    setAuthState({
      user: userData,
      isAuthenticated: true,
      isLoading: false,
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};

// Role-based navigation helper
export const getDefaultRoute = (role: string) => {
  switch (role) {
    case 'INSTRUCTOR':
      return '/instructor';
    case 'STUDENT':
      return '/dashboard';
    case 'ADMIN':
      return '/admin';
    default:
      return '/dashboard';
  }
};

// Check if user has permission for a route
export const hasRoutePermission = (userRole: string, route: string): boolean => {
  if (route.startsWith('/instructor')) {
    return userRole === 'INSTRUCTOR' || userRole === 'ADMIN';
  }
  if (route.startsWith('/admin')) {
    return userRole === 'ADMIN';
  }
  // Student routes are accessible by all authenticated users
  return true;
};