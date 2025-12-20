'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Button,
  Divider,
  LinearProgress,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  TrendingUp,
  Grade,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { useRecentActivities } from '@/hooks/useActivities';
import { Activity as APIActivity } from '@/hooks/useActivities';

interface ActivityDisplay extends APIActivity {
  displayType: 'assignment' | 'submission' | 'grade' | 'achievement' | 'deadline' | 'activity';
  displayStatus: 'completed' | 'pending' | 'overdue' | 'new';
  timestamp: string;
}

const formatTimestamp = (createdAt: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
};

const transformActivity = (activity: APIActivity, isClient: boolean = false): ActivityDisplay => {
  // Format timestamp - only calculate relative time on client
  const createdAt = new Date(activity.createdAt);
  const timestamp = isClient ? formatTimestamp(createdAt) : 'Just now';

  return {
    ...activity,
    displayType: (activity.type?.toLowerCase() as unknown) || 'activity',
    displayStatus: 'new',
    timestamp,
  };
};

const mockActivitiesBackup: unknown[] = [
  {
    id: 'activity-1',
    type: 'assignment',
    title: 'Physics Lab Report',
    course: 'Physics 101',
    description: 'Submit your analysis of the pendulum experiment',
    timestamp: '2 hours ago',
    status: 'pending',
    dueDate: 'Tomorrow at 11:59 PM'
  },
  {
    id: 'activity-2',
    type: 'grade',
    title: 'Mathematics Quiz #3',
    course: 'Advanced Math',
    description: 'Quiz results have been published',
    timestamp: '4 hours ago',
    status: 'new',
    grade: 'A-'
  },
  {
    id: 'activity-3',
    type: 'submission',
    title: 'English Essay Submitted',
    course: 'English Literature',
    description: 'Your essay on Shakespeare has been submitted successfully',
    timestamp: '1 day ago',
    status: 'completed',
    progress: 100
  },
  {
    id: 'activity-4',
    type: 'achievement',
    title: 'Completed 10 Assignments',
    course: 'Overall Progress',
    description: 'Congratulations! You\'ve completed 10 assignments this semester',
    timestamp: '2 days ago',
    status: 'completed'
  },
  {
    id: '5',
    type: 'deadline',
    title: 'Computer Science Project Due',
    course: 'CS 201',
    description: 'Final project submission deadline approaching',
    timestamp: '3 days ago',
    status: 'pending',
    dueDate: 'In 2 days'
  }
];

const getActivityIcon = (type: ActivityDisplay['displayType'], status: ActivityDisplay['displayStatus']) => {
  const iconProps = { fontSize: 'small' as const };
  
  switch (type) {
    case 'assignment':
      return <Assignment {...iconProps} sx={{ color: '#f59e0b' }} />;
    case 'submission':
      return <CheckCircle {...iconProps} sx={{ color: '#10b981' }} />;
    case 'grade':
      return <Grade {...iconProps} sx={{ color: '#8b5cf6' }} />;
    case 'achievement':
      return <TrendingUp {...iconProps} sx={{ color: '#06b6d4' }} />;
    case 'deadline':
      return <Schedule {...iconProps} sx={{ color: status === 'overdue' ? '#ef4444' : '#f59e0b' }} />;
    default:
      return <Assignment {...iconProps} />;
  }
};

const getStatusColor = (status: ActivityDisplay['displayStatus']) => {
  switch (status) {
    case 'completed': return { bg: '#dcfce7', color: '#166534' };
    case 'pending': return { bg: '#fef3c7', color: '#92400e' };
    case 'overdue': return { bg: '#fecaca', color: '#991b1b' };
    case 'new': return { bg: '#dbeafe', color: '#1e40af' };
    default: return { bg: '#f3f4f6', color: '#374151' };
  }
};

export default function RecentActivities() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Fetch recent activities from API
  const { data: apiActivities, isLoading, error, refetch } = useRecentActivities(20);

  // Transform API activities to display format
  const activities = apiActivities ? apiActivities.map(a => transformActivity(a, isClient)) : [];
  
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.displayStatus === filter;
  });

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Alert severity="error">
          Failed to load activities. Please try again later.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment sx={{ color: '#667eea' }} />
          <Typography variant="h6" fontWeight={600}>
            Recent Activities
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small">
            <FilterList />
          </IconButton>
          <IconButton size="small" onClick={() => refetch()}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        {['all', 'pending', 'completed'].map((filterOption) => (
          <Chip
            key={filterOption}
            label={filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            onClick={() => setFilter(filterOption as typeof filter)}
            variant={filter === filterOption ? 'filled' : 'outlined'}
            size="small"
            sx={{
              bgcolor: filter === filterOption ? '#667eea' : 'transparent',
              color: filter === filterOption ? 'white' : 'text.secondary',
              borderColor: '#e2e8f0',
              '&:hover': {
                bgcolor: filter === filterOption ? '#5a67d8' : '#f8fafc'
              }
            }}
          />
        ))}
      </Box>

      {/* Activities List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto' }}>
        {filteredActivities.map((activity, index) => {
          const statusStyle = getStatusColor(activity.displayStatus);
          
          return (
            <Box key={activity.id}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    borderColor: '#cbd5e1'
                  }
                }}
              >
                {/* Icon */}
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {getActivityIcon(activity.displayType, activity.displayStatus)}
                </Avatar>

                {/* Content */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {activity.description || 'Activity'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.course?.title || 'General'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Chip
                        label={activity.displayStatus}
                        size="small"
                        sx={{
                          bgcolor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {activity.timestamp}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {activity.type}
                  </Typography>

                  {/* Action Buttons */}
                  {activity.displayStatus === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#e2e8f0',
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
              
              {index < filteredActivities.length - 1 && (
                <Divider sx={{ my: 1, opacity: 0.3 }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* View All Button */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}
        >
          View All Activities
        </Button>
      </Box>
    </Paper>
  );
}