'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Event as EventIcon } from '@mui/icons-material';
import { api } from '@/lib/api';

interface ScheduleEvent {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string | null;
  color: string;
  recurrence: string;
  dayOfWeek: number | null;
  startDate: string;
  endDate: string | null;
}

interface ScheduleForm {
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string;
  recurrence: 'one-time' | 'weekly' | 'daily';
  dayOfWeek: string;
  startDate: string;
  endDate: string;
}

export default function InstructorSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [form, setForm] = useState<ScheduleForm>({
    title: '',
    type: 'lecture',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    recurrence: 'weekly',
    dayOfWeek: '1',
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');

  const { data: scheduleEvents, isLoading } = useQuery<ScheduleEvent[]>({
    queryKey: ['instructor', 'courses', courseId, 'schedule'],
    queryFn: async () => {
      const response = await api.get(`/instructor/courses/${courseId}/schedule`);
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/instructor/courses/${courseId}/schedule`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'schedule'] });
      closeDialog();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create schedule event');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ eventId, data }: any) => {
      const response = await api.patch(`/instructor/courses/${courseId}/schedule/${eventId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'schedule'] });
      closeDialog();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update schedule event');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await api.delete(`/instructor/courses/${courseId}/schedule/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'schedule'] });
    }
  });

  const openCreateDialog = () => {
    setEditingEvent(null);
    setForm({
      title: '',
      type: 'lecture',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      recurrence: 'weekly',
      dayOfWeek: '1',
      startDate: '',
      endDate: ''
    });
    setDialogOpen(true);
    setError('');
  };

  const openEditDialog = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      recurrence: event.recurrence as any,
      dayOfWeek: event.dayOfWeek?.toString() || '1',
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate ? event.endDate.split('T')[0] : ''
    });
    setDialogOpen(true);
    setError('');
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = () => {
    if (!form.title || !form.startDate) {
      setError('Title and start date are required');
      return;
    }

    const data = {
      title: form.title,
      type: form.type,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location || undefined,
      recurrence: form.recurrence,
      dayOfWeek: form.recurrence === 'weekly' ? parseInt(form.dayOfWeek) : undefined,
      startDate: form.startDate,
      endDate: form.endDate || undefined
    };

    if (editingEvent) {
      updateMutation.mutate({ eventId: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (eventId: string) => {
    if (confirm('Are you sure you want to delete this schedule event?')) {
      deleteMutation.mutate(eventId);
    }
  };

  const getDayName = (dayNum: number | null) => {
    if (dayNum === null) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const getRecurrenceLabel = (event: ScheduleEvent) => {
    if (event.recurrence === 'weekly') {
      return `Weekly on ${getDayName(event.dayOfWeek)}`;
    }
    if (event.recurrence === 'daily') {
      return 'Daily';
    }
    return 'One-time';
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
              Class Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course?.title} ({course?.code})
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Add Event
          </Button>
        </Box>

        {/* Schedule Events */}
        {!scheduleEvents || scheduleEvents.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No schedule events yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Create your class schedule with recurring or one-time events
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                >
                  Add Event
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {scheduleEvents.map((event) => (
              <Card key={event.id} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" noWrap>
                          {event.title}
                        </Typography>
                        <Box>
                          <IconButton size="small" onClick={() => openEditDialog(event)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(event.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Chip
                        label={event.type}
                        size="small"
                        sx={{ width: 'fit-content' }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        ⏰ {event.startTime} - {event.endTime}
                      </Typography>

                      {event.location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {event.location}
                        </Typography>
                      )}

                      <Typography variant="caption" color="primary">
                        {getRecurrenceLabel(event)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Starts: {new Date(event.startDate).toLocaleDateString()}
                        {event.endDate && ` • Ends: ${new Date(event.endDate).toLocaleDateString()}`}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
            ))}
          </Box>
        )}
      </Stack>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Edit Schedule Event' : 'Create Schedule Event'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              label="Event Title"
              required
              fullWidth
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Monday Lecture"
            />

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                label="Type"
              >
                <MenuItem value="lecture">Lecture</MenuItem>
                <MenuItem value="lab">Lab</MenuItem>
                <MenuItem value="office_hours">Office Hours</MenuItem>
                <MenuItem value="exam">Exam</MenuItem>
                <MenuItem value="review">Review Session</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" gap={2}>
              <TextField
                label="Start Time"
                type="time"
                required
                fullWidth
                value={form.startTime}
                onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="time"
                required
                fullWidth
                value={form.endTime}
                onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              label="Location"
              fullWidth
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Room 301"
            />

            <FormControl fullWidth required>
              <InputLabel>Recurrence</InputLabel>
              <Select
                value={form.recurrence}
                onChange={(e) => setForm(prev => ({ ...prev, recurrence: e.target.value as any }))}
                label="Recurrence"
              >
                <MenuItem value="one-time">One-time Event</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
              </Select>
            </FormControl>

            {form.recurrence === 'weekly' && (
              <FormControl fullWidth required>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                  label="Day of Week"
                >
                  <MenuItem value="0">Sunday</MenuItem>
                  <MenuItem value="1">Monday</MenuItem>
                  <MenuItem value="2">Tuesday</MenuItem>
                  <MenuItem value="3">Wednesday</MenuItem>
                  <MenuItem value="4">Thursday</MenuItem>
                  <MenuItem value="5">Friday</MenuItem>
                  <MenuItem value="6">Saturday</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField
              label="Start Date"
              type="date"
              required
              fullWidth
              value={form.startDate}
              onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            {form.recurrence !== 'one-time' && (
              <TextField
                label="End Date (Optional)"
                type="date"
                fullWidth
                value={form.endDate}
                onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for recurring events that don't end"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
