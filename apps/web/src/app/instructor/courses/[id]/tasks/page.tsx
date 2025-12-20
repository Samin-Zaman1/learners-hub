'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { api } from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  dueTime: string | null;
  maxPoints: number | null;
  statistics: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    graded: number;
    completionRate: string;
  };
}

export default function InstructorTasksPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['instructor', 'courses', courseId, 'tasks'],
    queryFn: async () => {
      const response = await api.get(`/instructor/courses/${courseId}/tasks`);
      return response.data;
    }
  });

  const { data: course } = useQuery({
    queryKey: ['instructor', 'courses', courseId],
    queryFn: async () => {
      const response = await api.get(`/instructor/courses/${courseId}`);
      return response.data;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return '📝';
      case 'quiz':
        return '📋';
      case 'exam':
        return '📊';
      case 'project':
        return '🚀';
      case 'reading':
        return '📖';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString: string, timeString: string | null) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return timeString ? `${dateStr} at ${timeString}` : dateStr;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course?.title} ({course?.code})
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push(`/instructor/courses/${courseId}/tasks/create`)}
          >
            Create Task
          </Button>
        </Box>

        {/* Statistics */}
        {tasks && tasks.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Tasks
                </Typography>
                <Typography variant="h4">
                  {tasks.length}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Submissions
                </Typography>
                <Typography variant="h4">
                  {tasks.reduce((sum, t) => sum + t.statistics.total, 0)}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Needs Grading
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {tasks.reduce((sum, t) => sum + t.statistics.completed, 0)}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Graded
                </Typography>
                <Typography variant="h4" color="success.main">
                  {tasks.reduce((sum, t) => sum + t.statistics.graded, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Tasks List */}
        {!tasks || tasks.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Create your first task to assign work to students
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push(`/instructor/courses/${courseId}/tasks/create`)}
                >
                  Create Task
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {tasks.map((task) => (
              <Card key={task.id} sx={{ '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
                    <Box sx={{ flex: { md: '1 1 50%' } }}>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6">
                            {getTypeIcon(task.type)} {task.title}
                          </Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority)}
                          />
                        </Box>
                        {task.description && (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {task.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Due: {formatDate(task.dueDate, task.dueTime)}
                          {task.maxPoints && ` • ${task.maxPoints} points`}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ flex: { md: '1 1 33%' } }}>
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Completion Rate
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {task.statistics.completionRate}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(task.statistics.completionRate)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Chip label={`${task.statistics.pending} Pending`} size="small" />
                          <Chip label={`${task.statistics.inProgress} In Progress`} size="small" color="info" />
                          <Chip label={`${task.statistics.completed} Submitted`} size="small" color="warning" />
                          <Chip label={`${task.statistics.graded} Graded`} size="small" color="success" />
                        </Box>
                      </Stack>
                    </Box>

                    <Box sx={{ flex: { md: '0 0 auto' } }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="View Submissions">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/instructor/courses/${courseId}/tasks/${task.id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
