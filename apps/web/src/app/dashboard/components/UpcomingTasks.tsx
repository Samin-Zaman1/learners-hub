'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment,
  Schedule,
  PriorityHigh,
  CheckCircle,
  AccessTime,
  CalendarToday,
  MoreVert,
  PlayArrow,
  Flag,
  EmojiEvents,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface TaskSubmission {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED';
  progress: number;
  grade: string | null;
  points: number | null;
  task: {
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    dueDate: string;
    dueTime: string | null;
    maxPoints: number;
    course: {
      id: string;
      title: string;
      code: string;
      color: string;
    };
  };
}

interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  gradedTasks: number;
  overdueTasks: number;
}

export default function UpcomingTasks() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'high-priority' | 'graded'>('all');

  // Fetch upcoming tasks from student endpoint
  const { data: submissions, isLoading, error } = useQuery<TaskSubmission[]>({
    queryKey: ['student', 'tasks', 'upcoming'],
    queryFn: async () => {
      const response = await api.get('/student/tasks/upcoming', { params: { days: 7 } });
      return response.data;
    }
  });

  const { data: stats } = useQuery<TaskStats>({
    queryKey: ['student', 'tasks', 'statistics'],
    queryFn: async () => {
      const response = await api.get('/student/tasks/statistics');
      return response.data;
    }
  });

  const updateSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, data }: { submissionId: string; data: unknown }) => {
      const response = await api.patch(`/student/tasks/${submissionId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks', 'statistics'] });
    }
  });

  const filteredSubmissions = submissions?.filter(sub => {
    if (filter === 'all') return true;
    if (filter === 'pending') return sub.status === 'PENDING';
    if (filter === 'in-progress') return sub.status === 'IN_PROGRESS';
    if (filter === 'graded') return sub.status === 'GRADED';
    if (filter === 'high-priority') return sub.task?.priority === 'HIGH';
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED': return '#8b5cf6';
      case 'COMPLETED': return '#10b981';
      case 'IN_PROGRESS': return '#667eea';
      case 'PENDING': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'assignment': return <Assignment fontSize="small" />;
      case 'quiz': return <Schedule fontSize="small" />;
      case 'exam': return <PriorityHigh fontSize="small" />;
      case 'project': return <Flag fontSize="small" />;
      case 'reading': return <CalendarToday fontSize="small" />;
      default: return <Assignment fontSize="small" />;
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'COMPLETED' && status !== 'GRADED';
  };

  const handleStartTask = (submissionId: string) => {
    updateSubmissionMutation.mutate({
      submissionId,
      data: { status: 'IN_PROGRESS', progress: 10 }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Alert severity="error">
          Failed to load tasks. Please try again later.
        </Alert>
      </Paper>
    );
  }

  const pendingCount = submissions?.filter(s => s.status === 'PENDING').length || 0;
  const inProgressCount = submissions?.filter(s => s.status === 'IN_PROGRESS').length || 0;
  const gradedCount = submissions?.filter(s => s.status === 'GRADED').length || 0;
  const highPriorityCount = submissions?.filter(s => s.task?.priority === 'HIGH').length || 0;

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment sx={{ color: '#667eea' }} />
          <Typography variant="h6" fontWeight={600}>
            Upcoming Tasks
          </Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            sx={{
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2e8f0'
              }
            }}
          >
            <MenuItem value="all">All ({submissions?.length || 0})</MenuItem>
            <MenuItem value="pending">Pending ({pendingCount})</MenuItem>
            <MenuItem value="in-progress">In Progress ({inProgressCount})</MenuItem>
            <MenuItem value="graded">Graded ({gradedCount})</MenuItem>
            <MenuItem value="high-priority">High Priority ({highPriorityCount})</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Summary */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: '120px', p: 1.5, bgcolor: '#f0f9ff', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Overdue</Typography>
            <Typography variant="h6" fontWeight={600}>{stats.overdueTasks}</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: '120px', p: 1.5, bgcolor: '#fef3c7', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Pending</Typography>
            <Typography variant="h6" fontWeight={600}>{stats.pendingTasks}</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: '120px', p: 1.5, bgcolor: '#f3f4f6', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">In Progress</Typography>
            <Typography variant="h6" fontWeight={600}>{stats.inProgressTasks}</Typography>
          </Box>
        </Box>
      )}

      {/* Tasks List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 500, overflowY: 'auto' }}>
        {!filteredSubmissions || filteredSubmissions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {filter === 'all' ? 'No upcoming tasks' : `No ${filter} tasks`}
            </Typography>
          </Box>
        ) : (
          filteredSubmissions.map((submission, index) => {
            const task = submission.task;
            if (!task) return null; // Skip if task is undefined
            
            const overdue = isOverdue(task.dueDate, submission.status);
            
            return (
              <Box key={submission.id}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: submission.status === 'GRADED' ? '#faf5ff' : 
                            submission.status === 'COMPLETED' ? '#f0fdf4' : 
                            overdue ? '#fef2f2' : '#f8fafc',
                    border: `1px solid ${
                      submission.status === 'GRADED' ? '#e9d5ff' :
                      submission.status === 'COMPLETED' ? '#d1fae5' : 
                      overdue ? '#fecaca' : '#e2e8f0'
                    }`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  {/* Task Type Icon */}
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: task.course.color,
                      color: 'white'
                    }}
                  >
                    {getTypeIcon(task.type)}
                  </Avatar>

                  {/* Task Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Task Title and Priority */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {task.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                          label={task.priority}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(task.priority),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 18
                          }}
                        />
                        <Chip
                          label={submission.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(submission.status),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 18
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Course Badge */}
                    <Chip
                      label={`${task.course.code}: ${task.course.title}`}
                      size="small"
                      sx={{
                        bgcolor: `${task.course.color}20`,
                        color: task.course.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        mb: 1,
                        height: 20
                      }}
                    />

                    {/* Progress Bar */}
                    {submission.status === 'IN_PROGRESS' && (
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {submission.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={submission.progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: task.course.color,
                              borderRadius: 3
                            }
                          }}
                        />
                      </Box>
                    )}

                    {/* Grade Display */}
                    {submission.status === 'GRADED' && submission.grade && (
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEvents sx={{ fontSize: 16, color: '#8b5cf6' }} />
                        <Typography variant="caption" fontWeight={600} color="primary">
                          Grade: {submission.grade} ({submission.points}/{task.maxPoints} pts)
                        </Typography>
                      </Box>
                    )}

                    {/* Due Date and Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 14, color: overdue ? '#ef4444' : 'text.secondary' }} />
                        <Typography 
                          variant="caption" 
                          color={overdue ? 'error' : 'text.secondary'}
                          fontWeight={overdue ? 600 : 400}
                        >
                          Due: {formatDueDate(task.dueDate)} {task.dueTime && `at ${task.dueTime}`}
                          {overdue && ' (Overdue)'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {submission.status === 'PENDING' && (
                          <Button
                            size="small"
                            startIcon={<PlayArrow fontSize="small" />}
                            onClick={() => handleStartTask(submission.id)}
                            disabled={updateSubmissionMutation.isPending}
                            sx={{
                              bgcolor: task.course.color,
                              color: 'white',
                              textTransform: 'none',
                              fontSize: '0.7rem',
                              px: 1.5,
                              '&:hover': {
                                bgcolor: task.course.color,
                                filter: 'brightness(0.9)'
                              }
                            }}
                          >
                            Start
                          </Button>
                        )}
                        
                        {submission.status === 'COMPLETED' && (
                          <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                {index < filteredSubmissions.length - 1 && (
                  <Divider sx={{ my: 1, opacity: 0.5 }} />
                )}
              </Box>
            );
          })
        )}
      </Box>

      {/* Summary Footer */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredSubmissions?.filter(s => s.status !== 'COMPLETED' && s.status !== 'GRADED').length || 0} tasks remaining
        </Typography>
        
        <Button
          variant="outlined"
          size="small"
          onClick={() => router.push('/tasks')}
          sx={{
            textTransform: 'none',
            borderColor: '#667eea',
            color: '#667eea',
            '&:hover': {
              bgcolor: '#667eea10',
              borderColor: '#667eea'
            }
          }}
        >
          View All Tasks
        </Button>
      </Box>
    </Paper>
  );
}