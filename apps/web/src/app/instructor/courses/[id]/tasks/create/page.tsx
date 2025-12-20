'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { api } from '@/lib/api';
import { PageHeader } from '@/components';

interface CreateTaskForm {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  maxPoints: string;
  estimatedTime: string;
}

export default function CreateTaskPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;

  const [form, setForm] = useState<CreateTaskForm>({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    type: 'assignment',
    priority: 'MEDIUM',
    maxPoints: '',
    estimatedTime: ''
  });

  const [error, setError] = useState('');

  const { data: course } = useQuery({
    queryKey: ['instructor', 'courses', courseId],
    queryFn: async () => {
      const response = await api.get(`/instructor/courses/${courseId}`);
      return response.data;
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await api.post(`/instructor/courses/${courseId}/tasks`, taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'tasks'] });
      router.push(`/instructor/courses/${courseId}/tasks`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.dueDate) {
      setError('Title and due date are required');
      return;
    }

    createTaskMutation.mutate({
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate,
      dueTime: form.dueTime || undefined,
      type: form.type,
      priority: form.priority,
      maxPoints: form.maxPoints ? parseInt(form.maxPoints) : undefined,
      estimatedTime: form.estimatedTime || undefined
    });
  };

  const handleChange = (field: keyof CreateTaskForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        <PageHeader
          title="Create New Task"
          description="Set up a new assignment, quiz, or project for your students"
          breadcrumbs={[
            { label: 'Courses', href: '/instructor' },
            { label: course?.title || 'Course', href: `/instructor/courses/${params.id}` },
            { label: 'Tasks', href: `/instructor/courses/${params.id}/tasks` },
            { label: 'Create New Task' }
          ]}
          action={
            <Button
              startIcon={<BackIcon />}
              onClick={() => router.back()}
              variant="outlined"
            >
              Back
            </Button>
          }
        />

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Box className="form-container">
                <TextField
                  label="Task Title"
                  required
                  fullWidth
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Chapter 5 Homework"
                  className="form-full-width"
                />

                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide instructions, requirements, or additional details..."
                  className="form-full-width"
                />

                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={form.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="assignment">📝 Assignment</MenuItem>
                    <MenuItem value="quiz">📋 Quiz</MenuItem>
                    <MenuItem value="exam">📊 Exam</MenuItem>
                    <MenuItem value="project">🚀 Project</MenuItem>
                    <MenuItem value="reading">📖 Reading</MenuItem>
                    <MenuItem value="lab">🔬 Lab</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={form.priority}
                    onChange={(e) => handleChange('priority', e.target.value as any)}
                    label="Priority"
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Due Date"
                  type="date"
                  required
                  fullWidth
                  value={form.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Due Time"
                  type="time"
                  fullWidth
                  value={form.dueTime}
                  onChange={(e) => handleChange('dueTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Max Points"
                  type="number"
                  fullWidth
                  value={form.maxPoints}
                  onChange={(e) => handleChange('maxPoints', e.target.value)}
                  placeholder="100"
                  inputProps={{ min: 0 }}
                />

                <TextField
                  label="Estimated Time"
                  fullWidth
                  value={form.estimatedTime}
                  onChange={(e) => handleChange('estimatedTime', e.target.value)}
                  placeholder="e.g., 2 hours"
                />
              </Box>

              <Stack spacing={2} sx={{ mt: 3 }}>

                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={createTaskMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={createTaskMutation.isPending}
                  >
                    {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
