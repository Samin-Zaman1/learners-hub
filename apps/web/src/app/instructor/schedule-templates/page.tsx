'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  PlayArrow as ApplyIcon
} from '@mui/icons-material';

interface ScheduleTemplate {
  id: string;
  name: string;
  description: string | null;
  pattern: string;
  isPublic: boolean;
  events: Array<{
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    location?: string;
    recurrence: string;
    dayOfWeek?: number;
  }>;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  code: string;
}

export default function ScheduleTemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: templates, isLoading } = useQuery<ScheduleTemplate[]>({
    queryKey: ['instructor', 'schedule-templates'],
    queryFn: () => api.get('/instructor/schedule-templates').then(res => res.data)
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['instructor', 'courses'],
    queryFn: () => api.get('/instructor/courses').then(res => res.data)
  });

  const deleteMutation = useMutation({
    mutationFn: (templateId: string) =>
      api.delete(`/instructor/schedule-templates/${templateId}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'schedule-templates'] });
      setSnackbar({ open: true, message: 'Template deleted successfully', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to delete template', severity: 'error' });
    }
  });

  const applyMutation = useMutation({
    mutationFn: ({ courseId, templateId, startDate }: { courseId: string; templateId: string; startDate: string }) =>
      api.post(`/instructor/courses/${courseId}/schedule/apply-template`, { templateId, startDate }).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', selectedCourseId, 'schedule'] });
      setApplyDialogOpen(false);
      setSnackbar({ open: true, message: `Template applied successfully! ${data.created} events created.`, severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to apply template', severity: 'error' });
    }
  });

  const handleViewTemplate = (template: ScheduleTemplate) => {
    setSelectedTemplate(template);
    setViewDialogOpen(true);
  };

  const handleApplyTemplate = (template: ScheduleTemplate) => {
    setSelectedTemplate(template);
    setSelectedCourseId('');
    setStartDate('');
    setApplyDialogOpen(true);
  };

  const handleApplySubmit = () => {
    if (!selectedCourseId || !startDate || !selectedTemplate) {
      setSnackbar({ open: true, message: 'Please select a course and start date', severity: 'error' });
      return;
    }
    applyMutation.mutate({
      courseId: selectedCourseId,
      templateId: selectedTemplate.id,
      startDate
    });
  };

  const getDayName = (dayNum: number | undefined) => {
    if (dayNum === undefined) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || '';
  };

  const formatPattern = (pattern: string) => {
    const patterns: { [key: string]: string } = {
      'MWF': 'Monday, Wednesday, Friday',
      'TTh': 'Tuesday, Thursday',
      'MW': 'Monday, Wednesday',
      'Daily': 'Daily',
      'Weekly': 'Weekly',
      'Mixed': 'Mixed Schedule'
    };
    return patterns[pattern] || pattern;
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
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <IconButton onClick={() => router.back()} size="small">
                <BackIcon />
              </IconButton>
              <Typography variant="h4" fontWeight="bold">
                Schedule Templates
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Manage reusable schedule templates for your courses
            </Typography>
          </Box>
        </Box>

        {/* Info Alert */}
        <Alert severity="info">
          Templates can be created from the schedule page of any course. Once saved, you can apply them to other courses.
        </Alert>

        {/* Templates List */}
        {!templates || templates.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No templates yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Create your first template by saving a course schedule
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/instructor/courses')}
                >
                  Go to Courses
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {templates.map((template) => (
              <Card key={template.id} sx={{ '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box flex={1}>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6">{template.name}</Typography>
                          <Chip
                            icon={template.isPublic ? <PublicIcon /> : <PrivateIcon />}
                            label={template.isPublic ? 'Public' : 'Private'}
                            size="small"
                            color={template.isPublic ? 'success' : 'default'}
                          />
                          <Chip
                            label={formatPattern(template.pattern)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        {template.description && (
                          <Typography variant="body2" color="text.secondary">
                            {template.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {template.events.length} events • Created {new Date(template.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewTemplate(template)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Apply to Course">
                        <IconButton size="small" onClick={() => handleApplyTemplate(template)} color="primary">
                          <ApplyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Template">
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this template?')) {
                              deleteMutation.mutate(template.id);
                            }
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* View Template Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Template Details</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="body1">{selectedTemplate.name}</Typography>
              </Box>
              {selectedTemplate.description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedTemplate.description}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Pattern</Typography>
                <Typography variant="body1">{formatPattern(selectedTemplate.pattern)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Schedule Events ({selectedTemplate.events.length})
                </Typography>
                <List>
                  {selectedTemplate.events.map((event, index) => (
                    <ListItem key={index} divider={index < selectedTemplate.events.length - 1}>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <>
                            {event.type} • {getDayName(event.dayOfWeek)} • {event.startTime} - {event.endTime}
                            {event.location && ` • ${event.location}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              if (selectedTemplate) handleApplyTemplate(selectedTemplate);
            }}
            variant="contained"
          >
            Apply to Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Template to Course</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedTemplate && (
              <Alert severity="info">
                Applying: <strong>{selectedTemplate.name}</strong> ({selectedTemplate.events.length} events)
              </Alert>
            )}
            <FormControl fullWidth>
              <InputLabel>Select Course</InputLabel>
              <Select
                value={selectedCourseId}
                label="Select Course"
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {courses?.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="The template will be applied starting from this date"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApplySubmit}
            variant="contained"
            disabled={applyMutation.isPending || !selectedCourseId || !startDate}
          >
            {applyMutation.isPending ? 'Applying...' : 'Apply Template'}
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
