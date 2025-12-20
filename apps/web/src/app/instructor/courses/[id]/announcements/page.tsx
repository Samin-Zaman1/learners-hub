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
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PushPin as PinIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'URGENT' | 'GENERAL' | 'EVENT' | 'REMINDER';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface AnnouncementForm {
  title: string;
  content: string;
  type: 'URGENT' | 'GENERAL' | 'EVENT' | 'REMINDER';
  isPinned: boolean;
}

export default function InstructorAnnouncementsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementForm>({
    title: '',
    content: '',
    type: 'GENERAL',
    isPinned: false
  });
  const [error, setError] = useState('');

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['instructor', 'courses', courseId, 'announcements'],
    queryFn: async () => {
      const response = await api.get(`/instructor/courses/${courseId}/announcements`);
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
    mutationFn: async (data: AnnouncementForm) => {
      const response = await api.post(`/instructor/courses/${courseId}/announcements`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'announcements'] });
      closeDialog();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create announcement');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ announcementId, data }: any) => {
      const response = await api.patch(`/instructor/courses/${courseId}/announcements/${announcementId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'announcements'] });
      closeDialog();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update announcement');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      await api.delete(`/instructor/courses/${courseId}/announcements/${announcementId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'announcements'] });
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await api.patch(`/instructor/courses/${courseId}/announcements/${announcementId}/toggle-pin`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'announcements'] });
    }
  });

  const openCreateDialog = () => {
    setEditingAnnouncement(null);
    setForm({
      title: '',
      content: '',
      type: 'GENERAL',
      isPinned: false
    });
    setDialogOpen(true);
    setError('');
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isPinned: announcement.isPinned
    });
    setDialogOpen(true);
    setError('');
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = () => {
    if (!form.title || !form.content) {
      setError('Title and content are required');
      return;
    }

    if (editingAnnouncement) {
      updateMutation.mutate({ announcementId: editingAnnouncement.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (announcementId: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate(announcementId);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'error';
      case 'EVENT':
        return 'primary';
      case 'REMINDER':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URGENT':
        return '🚨';
      case 'EVENT':
        return '📅';
      case 'REMINDER':
        return '⏰';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              Announcements
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
            New Announcement
          </Button>
        </Box>

        {/* Announcements List */}
        {!announcements || announcements.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No announcements yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Keep your students informed by posting announcements
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                >
                  Create Announcement
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {announcements.map((announcement) => (
              <Card 
                key={announcement.id}
                sx={{ 
                  borderLeft: announcement.isPinned ? 4 : 0,
                  borderColor: 'primary.main'
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          {announcement.isPinned && <PinIcon fontSize="small" color="primary" />}
                          <Typography variant="h6">
                            {getTypeIcon(announcement.type)} {announcement.title}
                          </Typography>
                          <Chip
                            label={announcement.type}
                            size="small"
                            color={getTypeColor(announcement.type)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {announcement.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Posted {formatDate(announcement.createdAt)}
                          {announcement.updatedAt !== announcement.createdAt && ' (edited)'}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => togglePinMutation.mutate(announcement.id)}
                          color={announcement.isPinned ? 'primary' : 'default'}
                        >
                          <PinIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => openEditDialog(announcement)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(announcement.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              label="Title"
              required
              fullWidth
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Exam Date Change"
            />

            <TextField
              label="Content"
              required
              fullWidth
              multiline
              rows={6}
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your announcement here..."
            />

            <Box display="flex" gap={2}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
                  label="Type"
                >
                  <MenuItem value="GENERAL">📢 General</MenuItem>
                  <MenuItem value="URGENT">🚨 Urgent</MenuItem>
                  <MenuItem value="EVENT">📅 Event</MenuItem>
                  <MenuItem value="REMINDER">⏰ Reminder</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Pin Status</InputLabel>
                <Select
                  value={form.isPinned ? 'pinned' : 'unpinned'}
                  onChange={(e) => setForm(prev => ({ ...prev, isPinned: e.target.value === 'pinned' }))}
                  label="Pin Status"
                >
                  <MenuItem value="unpinned">Not Pinned</MenuItem>
                  <MenuItem value="pinned">📌 Pinned to Top</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingAnnouncement ? 'Update' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
