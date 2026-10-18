'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Slider,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Assignment,
  Flag,
  EmojiEvents,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TaskSubmission {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED';
  progress: number;
  grade: string | null;
  points: number | null;
  feedback: string | null;
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
  completionRate: number;
  averageGrade: number | null;
}

export default function TaskManagementPage() {
  const [filter, setFilter] = useState<string>('all');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
  const queryClient = useQueryClient();

  const { data: submissions, isLoading: submissionsLoading, error: submissionsError } = useQuery<TaskSubmission[]>({
    queryKey: ['student', 'tasks'],
    queryFn: async () => {
      const response = await api.get('/student/tasks');
      return response.data;
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery<TaskStats>({
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
      setUpdateDialogOpen(false);
      setSelectedSubmission(null);
    }
  });

  const openUpdateDialog = (submission: TaskSubmission) => {
    setSelectedSubmission(submission);
    setProgress(submission.progress);
    setStatus(submission.status === 'GRADED' ? 'COMPLETED' : submission.status);
    setUpdateDialogOpen(true);
  };

  const handleUpdateSubmission = () => {
    if (!selectedSubmission) return;
    
    updateSubmissionMutation.mutate({
      submissionId: selectedSubmission.id,
      data: { progress, status }
    });
  };

  const filteredSubmissions = submissions?.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <DashboardLayout title="Task Management">
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={600}>
            My Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage tasks from all your courses
          </Typography>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: '160px' }}>
              <Assignment sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>{stats.totalTasks}</Typography>
              <Typography variant="body2" color="text.secondary">Total Tasks</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: '160px' }}>
              <Schedule sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>{stats.pendingTasks}</Typography>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: '160px' }}>
              <Flag sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>{stats.inProgressTasks}</Typography>
              <Typography variant="body2" color="text.secondary">In Progress</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: '160px' }}>
              <CheckCircle sx={{ fontSize: 32, color: '#10b981', mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>{stats.completedTasks}</Typography>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: '160px' }}>
              <EmojiEvents sx={{ fontSize: 32, color: '#8b5cf6', mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>{stats.gradedTasks}</Typography>
              <Typography variant="body2" color="text.secondary">Graded</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', flex: '1 1 200px', minWidth: '160px' }}>
              <Flag sx={{ fontSize: 32, color: '#ef4444', mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>{stats.overdueTasks}</Typography>
              <Typography variant="body2" color="text.secondary">Overdue</Typography>
            </Paper>
          </Box>
        )}

        {/* Completion Rate */}
        {stats && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Completion Rate: {typeof stats.completionRate === 'number' ? stats.completionRate.toFixed(1) : '0'}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={typeof stats.completionRate === 'number' ? stats.completionRate : 0}
              sx={{ height: 8, borderRadius: 4 }}
            />
            {stats.averageGrade !== null && typeof stats.averageGrade === 'number' && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Average Grade: {stats.averageGrade.toFixed(1)}%
              </Typography>
            )}
          </Paper>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['all', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'GRADED'].map((filterStatus) => (
              <Chip
                key={filterStatus}
                label={filterStatus === 'all' ? 'All Tasks' : filterStatus.replace('_', ' ')}
                onClick={() => setFilter(filterStatus)}
                variant={filter === filterStatus ? 'filled' : 'outlined'}
                color={filter === filterStatus ? 'primary' : 'default'}
              />
            ))}
          </Box>
        </Paper>

        {/* Tasks List */}
        <Paper sx={{ p: 3 }}>
          {submissionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : submissionsError ? (
            <Alert severity="error">Failed to load tasks. Please try again later.</Alert>
          ) : !filteredSubmissions || filteredSubmissions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === 'all' 
                  ? 'Your instructors will assign tasks that will appear here'
                  : `No ${filter.toLowerCase()} tasks at this time`
                }
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredSubmissions.map((submission) => {
                const task = submission.task;
                if (!task) return null; // Skip if task is undefined
                
                const overdue = isOverdue(task.dueDate) && submission.status !== 'COMPLETED' && submission.status !== 'GRADED';
                
                return (
                  <Box
                    key={submission.id}
                    sx={{
                      p: 2,
                      border: overdue ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: 2,
                      bgcolor: overdue ? '#fef2f2' : 'white',
                      '&:hover': { bgcolor: overdue ? '#fee2e2' : '#f8fafc' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                          {task.title}
                        </Typography>
                        
                        {task.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {task.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={submission.status}
                            sx={{ bgcolor: getStatusColor(submission.status), color: 'white' }}
                          />
                          <Chip
                            size="small"
                            label={task.priority}
                            sx={{ bgcolor: getPriorityColor(task.priority), color: 'white' }}
                          />
                          <Chip
                            size="small"
                            label={task.type}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`${task.course.code}: ${task.course.title}`}
                            sx={{ bgcolor: `${task.course.color}20`, color: task.course.color }}
                          />
                          {overdue && (
                            <Chip
                              size="small"
                              label="OVERDUE"
                              sx={{ bgcolor: '#ef4444', color: 'white' }}
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                          {task.dueTime && (
                            <Typography variant="body2" color="text.secondary">
                              at {task.dueTime}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            • Max Points: {task.maxPoints}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Progress: {submission.progress}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={submission.progress}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        
                        {submission.status === 'GRADED' && submission.grade && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight={600} color="primary">
                              Grade: {submission.grade} ({submission.points}/{task.maxPoints} points)
                            </Typography>
                            {submission.feedback && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Feedback: {submission.feedback}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                      
                      {submission.status !== 'GRADED' && (
                        <Box sx={{ ml: 2 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => openUpdateDialog(submission)}
                          >
                            Update Progress
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* Update Progress Dialog */}
        <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Task Progress</DialogTitle>
          <DialogContent>
            {selectedSubmission && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {selectedSubmission.task.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedSubmission.task.course.code}: {selectedSubmission.task.course.title}
                  </Typography>
                </Box>
                
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    label="Status"
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </FormControl>
                
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Progress: {progress}%
                  </Typography>
                  <Slider
                    value={progress}
                    onChange={(_, value) => setProgress(value as number)}
                    min={0}
                    max={100}
                    step={5}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 50, label: '50%' },
                      { value: 100, label: '100%' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateSubmission} 
              variant="contained"
              disabled={updateSubmissionMutation.isPending}
            >
              {updateSubmissionMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}