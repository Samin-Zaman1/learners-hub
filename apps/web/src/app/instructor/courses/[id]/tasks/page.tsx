'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  PlaylistAdd as BulkAddIcon,
  Assessment as GradeIcon
} from '@mui/icons-material';
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
  const queryClient = useQueryClient();
  const courseId = params.id as string;

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [bulkTasks, setBulkTasks] = useState([{
    title: '',
    description: '',
    type: 'assignment',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    dueDate: '',
    dueTime: '',
    maxPoints: ''
  }]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

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

  const duplicateMutation = useMutation({
    mutationFn: async ({ taskId, dueDate }: { taskId: string; dueDate?: string }) => {
      const response = await api.post(`/instructor/courses/${courseId}/tasks/${taskId}/duplicate`, {
        newDueDate: dueDate || undefined
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'tasks'] });
      setDuplicateDialogOpen(false);
      setSnackbar({ open: true, message: 'Task duplicated successfully', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to duplicate task', severity: 'error' });
    }
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (tasksData: any[]) => {
      const response = await api.post(`/instructor/courses/${courseId}/tasks/bulk`, { tasks: tasksData });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'tasks'] });
      setBulkDialogOpen(false);
      setBulkTasks([{
        title: '',
        description: '',
        type: 'assignment',
        priority: 'MEDIUM',
        dueDate: '',
        dueTime: '',
        maxPoints: ''
      }]);
      setSnackbar({ open: true, message: `${data.length} tasks created successfully`, severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to create tasks', severity: 'error' });
    }
  });

  const handleDuplicate = (task: Task) => {
    setSelectedTask(task);
    setNewDueDate('');
    setDuplicateDialogOpen(true);
  };

  const handleDuplicateSubmit = () => {
    if (selectedTask) {
      duplicateMutation.mutate({ taskId: selectedTask.id, dueDate: newDueDate });
    }
  };

  const handleAddBulkTask = () => {
    setBulkTasks([...bulkTasks, {
      title: '',
      description: '',
      type: 'assignment',
      priority: 'MEDIUM',
      dueDate: '',
      dueTime: '',
      maxPoints: ''
    }]);
  };

  const handleRemoveBulkTask = (index: number) => {
    setBulkTasks(bulkTasks.filter((_, i) => i !== index));
  };

  const handleBulkTaskChange = (index: number, field: string, value: any) => {
    const updated = [...bulkTasks];
    updated[index] = { ...updated[index], [field]: value };
    setBulkTasks(updated);
  };

  const handleBulkSubmit = () => {
    const validTasks = bulkTasks.filter(t => t.title && t.dueDate);
    if (validTasks.length === 0) {
      setSnackbar({ open: true, message: 'At least one task must have a title and due date', severity: 'error' });
      return;
    }

    const tasksData = validTasks.map(t => ({
      title: t.title,
      description: t.description || undefined,
      type: t.type,
      priority: t.priority,
      dueDate: t.dueDate,
      dueTime: t.dueTime || undefined,
      maxPoints: t.maxPoints ? parseInt(t.maxPoints) : undefined
    }));

    bulkCreateMutation.mutate(tasksData);
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
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<BulkAddIcon />}
              onClick={() => setBulkDialogOpen(true)}
            >
              Bulk Create
            </Button>
            <Button
              variant="outlined"
              startIcon={<GradeIcon />}
              onClick={() => router.push(`/instructor/courses/${courseId}/submissions`)}
            >
              View All Submissions
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push(`/instructor/courses/${courseId}/tasks/create`)}
            >
              Create Task
            </Button>
          </Stack>
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
                        <Tooltip title="Duplicate Task">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicate(task)}
                          >
                            <DuplicateIcon />
                          </IconButton>
                        </Tooltip>
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

      {/* Duplicate Task Dialog */}
      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Duplicate Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedTask && (
              <Alert severity="info">
                Duplicating: <strong>{selectedTask.title}</strong>
              </Alert>
            )}
            <TextField
              label="New Due Date (Optional)"
              type="date"
              fullWidth
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty to keep the original due date"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDuplicateSubmit}
            variant="contained"
            disabled={duplicateMutation.isPending}
          >
            {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Create Tasks Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Create Tasks</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {bulkTasks.map((task, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">Task {index + 1}</Typography>
                      {bulkTasks.length > 1 && (
                        <IconButton size="small" onClick={() => handleRemoveBulkTask(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <TextField
                      label="Title *"
                      fullWidth
                      value={task.title}
                      onChange={(e) => handleBulkTaskChange(index, 'title', e.target.value)}
                    />
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                      value={task.description}
                      onChange={(e) => handleBulkTaskChange(index, 'description', e.target.value)}
                    />
                    <Box display="flex" gap={2}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={task.type}
                          label="Type"
                          onChange={(e) => handleBulkTaskChange(index, 'type', e.target.value)}
                        >
                          <MenuItem value="assignment">Assignment</MenuItem>
                          <MenuItem value="quiz">Quiz</MenuItem>
                          <MenuItem value="exam">Exam</MenuItem>
                          <MenuItem value="project">Project</MenuItem>
                          <MenuItem value="reading">Reading</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={task.priority}
                          label="Priority"
                          onChange={(e) => handleBulkTaskChange(index, 'priority', e.target.value)}
                        >
                          <MenuItem value="LOW">Low</MenuItem>
                          <MenuItem value="MEDIUM">Medium</MenuItem>
                          <MenuItem value="HIGH">High</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box display="flex" gap={2}>
                      <TextField
                        label="Due Date *"
                        type="date"
                        fullWidth
                        value={task.dueDate}
                        onChange={(e) => handleBulkTaskChange(index, 'dueDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="Due Time"
                        type="time"
                        fullWidth
                        value={task.dueTime}
                        onChange={(e) => handleBulkTaskChange(index, 'dueTime', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                    <TextField
                      label="Max Points"
                      type="number"
                      fullWidth
                      value={task.maxPoints}
                      onChange={(e) => handleBulkTaskChange(index, 'maxPoints', e.target.value)}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddBulkTask}
            >
              Add Another Task
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBulkSubmit}
            variant="contained"
            disabled={bulkCreateMutation.isPending}
          >
            {bulkCreateMutation.isPending ? 'Creating...' : `Create ${bulkTasks.filter(t => t.title && t.dueDate).length} Tasks`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
