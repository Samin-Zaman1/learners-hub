'use client';

import { Box, Paper, Typography, Card, CardContent, Button } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  // Fetch analytics data from API
  const { data: stats } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/dashboard/stats').then(res => res.data),
  });

  const analyticsCards = [
    {
      title: 'Total Users',
      value: (stats as any)?.totalUsers || 0,
      change: '+12%',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#3b82f6',
    },
    {
      title: 'Active Courses',
      value: (stats as any)?.totalCourses || 0,
      change: '+5%',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#10b981',
    },
    {
      title: 'Total Enrollments',
      value: (stats as any)?.totalEnrollments || 0,
      change: '+18%',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
    },
    {
      title: 'Growth Rate',
      value: '23%',
      change: '+3%',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Analytics & Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Insights and trends across the platform
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{ textTransform: 'none' }}
        >
          Export Report
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {analyticsCards.map((card, index) => (
          <Card key={index} sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                    {card.change} from last month
                  </Typography>
                </Box>
                <Box sx={{ color: card.color }}>
                  {card.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts Placeholder */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* User Growth Chart */}
        <Paper sx={{ p: 3, boxShadow: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            User Growth
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Monthly user registration trends
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f9fafb', borderRadius: 1 }}>
            <Typography color="text.secondary">Chart coming soon</Typography>
          </Box>
        </Paper>

        {/* Course Popularity */}
        <Paper sx={{ p: 3, boxShadow: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Course Popularity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Top courses by enrollment
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f9fafb', borderRadius: 1 }}>
            <Typography color="text.secondary">Chart coming soon</Typography>
          </Box>
        </Paper>

        {/* Enrollment Trends */}
        <Paper sx={{ p: 3, boxShadow: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Enrollment Trends
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Weekly enrollment activity
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f9fafb', borderRadius: 1 }}>
            <Typography color="text.secondary">Chart coming soon</Typography>
          </Box>
        </Paper>

        {/* Role Distribution */}
        <Paper sx={{ p: 3, boxShadow: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Role Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            User breakdown by role
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f9fafb', borderRadius: 1 }}>
            <Typography color="text.secondary">Chart coming soon</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
