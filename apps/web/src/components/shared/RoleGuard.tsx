'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth, hasRoutePermission, getDefaultRoute } from '../../hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'INSTRUCTOR' | 'ADMIN')[];
  fallbackRoute?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
  fallbackRoute 
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      const defaultRoute = fallbackRoute || getDefaultRoute(user.role);
      router.push(defaultRoute);
      return;
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, fallbackRoute, router]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="textSecondary">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="textSecondary">
          Redirecting...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}