'use client';

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  // Fetch admin statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard/stats').then(res => res.data),
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: () => api.get('/admin/dashboard/recent-activity').then(res => res.data),
  });

  const statCards = [
    {
      title: 'Total Users',
      value: (stats as any)?.totalUsers || 0,
      change: '+12.5%',
      trend: 'up',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      title: 'Total Courses',
      value: (stats as any)?.totalCourses || 0,
      change: '+8.2%',
      trend: 'up',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      title: 'Active Enrollments',
      value: (stats as any)?.activeEnrollments || 0,
      change: '+15.3%',
      trend: 'up',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
    {
      title: 'System Activity',
      value: (stats as any)?.systemActivity || '95%',
      change: '-2.1%',
      trend: 'down',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
  ];

  const userBreakdown = [
    {
      role: 'Students',
      count: (stats as any)?.studentCount || 0,
      color: '#3b82f6',
      percentage: 75,
    },
    {
      role: 'Instructors',
      count: (stats as any)?.instructorCount || 0,
      color: '#10b981',
      percentage: 20,
    },
    {
      role: 'Admins',
      count: (stats as any)?.adminCount || 0,
      color: '#f59e0b',
      percentage: 5,
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here&apos;s what&apos;s happening with your LMS today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {statCards.map((card, index) => (
          <Card key={index} sx={{ height: '100%', boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      backgroundColor: card.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {card.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {card.trend === 'up' ? (
                    <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main' }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: card.trend === 'up' ? 'success.main' : 'error.main',
                      fontWeight: 600,
                    }}
                  >
                    {card.change}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* User Breakdown */}
        <Paper sx={{ p: 3, height: '100%', boxShadow: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              User Breakdown
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Distribution of users by role
            </Typography>
            {userBreakdown.map((item, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="600">
                    {item.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.count} ({item.percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e5e7eb',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: item.color,
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            ))}
        </Paper>

        {/* Recent Activity */}
        <Paper sx={{ p: 3, height: '100%', boxShadow: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Latest system events
            </Typography>
            {((recentActivity as any) || [
              { id: 1, type: 'enrollment', user: 'John Doe', action: 'enrolled in', target: 'Web Development', time: '2 hours ago' },
              { id: 2, type: 'course', user: 'Dr. Smith', action: 'created', target: 'Machine Learning', time: '5 hours ago' },
              { id: 3, type: 'user', user: 'Admin', action: 'added new', target: 'instructor account', time: '1 day ago' },
              { id: 4, type: 'enrollment', user: 'Jane Smith', action: 'completed', target: 'Database Systems', time: '2 days ago' },
            ]).slice(0, 5).map((activity: any) => (
              <Box
                key={activity.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor:
                      activity.type === 'enrollment'
                        ? '#dbeafe'
                        : activity.type === 'course'
                        ? '#d1fae5'
                        : '#fef3c7',
                    color:
                      activity.type === 'enrollment'
                        ? '#3b82f6'
                        : activity.type === 'course'
                        ? '#10b981'
                        : '#f59e0b',
                    width: 40,
                    height: 40,
                  }}
                >
                  {activity.type === 'enrollment' ? (
                    <PersonAddIcon />
                  ) : activity.type === 'course' ? (
                    <SchoolIcon />
                  ) : (
                    <PeopleIcon />
                  )}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    <strong>{activity.user}</strong> {activity.action}{' '}
                    <strong>{activity.target}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))}
        </Paper>

        {/* Course Status Overview */}
        <Paper sx={{ p: 3, boxShadow: 2, gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Course Status Overview
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 1 }}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="success.main">
                  {(stats as any)?.activeCourses || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Courses
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="warning.main">
                  {(stats as any)?.draftCourses || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Draft Courses
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="text.secondary">
                  {(stats as any)?.completedCourses || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Courses
                </Typography>
              </Box>
            </Box>
        </Paper>
      </Box>
    </Box>
  );
}
