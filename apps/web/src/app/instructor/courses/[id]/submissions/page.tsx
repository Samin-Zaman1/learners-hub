'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Grade as GradeIcon,
  Visibility as ViewIcon,
  FileDownload as DownloadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface Submission {
  id: string;
  task: {
    id: string;
    title: string;
    type: string;
    maxPoints: number | null;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED';
  progress: number;
  grade: number | null;
  points: number | null;
  submittedAt: string | null;
  feedback: string | null;
}

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;

  const [taskFilter, setTaskFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState<string>('');
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ points: '', feedback: '' });
  const [bulkGradeDialogOpen, setBulkGradeDialogOpen] = useState(false);
  const [bulkGradeForm, setBulkGradeForm] = useState({ points: '', feedback: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: course } = useQuery({
    queryKey: ['instructor', 'courses', courseId],
    queryFn: () => api.get(`/instructor/courses/${courseId}`).then(res => res.data)
  });

  const { data: tasks } = useQuery({
    queryKey: ['instructor', 'courses', courseId, 'tasks'],
    queryFn: () => api.get(`/instructor/courses/${courseId}/tasks`).then(res => res.data)
  });

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ['instructor', 'courses', courseId, 'submissions', taskFilter, statusFilter, studentFilter],
    queryFn: () =>
      api.get(`/instructor/courses/${courseId}/submissions`, {
        params: {
          taskId: taskFilter || undefined,
          status: statusFilter || undefined,
          studentId: studentFilter || undefined
        }
      }).then(res => res.data)
  });

  const gradeMutation = useMutation({
    mutationFn: ({ taskId, submissionId, data }: { taskId: string; submissionId: string; data: any }) =>
      api.patch(`/instructor/courses/${courseId}/tasks/${taskId}/submissions/${submissionId}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'tasks'] });
      setGradeDialogOpen(false);
      setSnackbar({ open: true, message: 'Submission graded successfully', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to grade submission', severity: 'error' });
    }
  });

  const bulkGradeMutation = useMutation({
    // The API grades in bulk per task, so send one request per task
    mutationFn: ({ submissionIds, points, feedback }: { submissionIds: string[]; points?: number; feedback?: string }) => {
      const byTask = new Map<string, string[]>();
      for (const submission of submissions ?? []) {
        if (!submissionIds.includes(submission.id)) continue;
        byTask.set(submission.task.id, [...(byTask.get(submission.task.id) ?? []), submission.id]);
      }
      return Promise.all(
        [...byTask].map(([taskId, ids]) =>
          api.patch(`/instructor/courses/${courseId}/tasks/${taskId}/grade-bulk`, {
            grades: ids.map(submissionId => ({ submissionId, points, feedback }))
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId, 'tasks'] });
      setBulkGradeDialogOpen(false);
      setSelectedSubmissions([]);
      setSnackbar({ open: true, message: `${selectedSubmissions.length} submissions graded successfully`, severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to grade submissions', severity: 'error' });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED': return 'success';
      case 'COMPLETED': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'PENDING': return 'default';
      default: return 'default';
    }
  };

  const handleGrade = (submission: Submission) => {
    setCurrentSubmission(submission);
    setGradeForm({
      points: submission.points?.toString() || '',
      feedback: submission.feedback || ''
    });
    setGradeDialogOpen(true);
  };

  const handleSubmitGrade = () => {
    if (!currentSubmission) return;
    gradeMutation.mutate({
      taskId: currentSubmission.task.id,
      submissionId: currentSubmission.id,
      data: {
        points: gradeForm.points ? parseFloat(gradeForm.points) : null,
        feedback: gradeForm.feedback || null
      }
    });
  };

  const handleBulkGrade = () => {
    bulkGradeMutation.mutate({
      submissionIds: selectedSubmissions,
      points: bulkGradeForm.points ? parseFloat(bulkGradeForm.points) : undefined,
      feedback: bulkGradeForm.feedback || undefined
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && submissions) {
      setSelectedSubmissions(submissions.map(s => s.id));
    } else {
      setSelectedSubmissions([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedSubmissions(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not submitted';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <IconButton onClick={() => router.back()} size="small">
                <BackIcon />
              </IconButton>
              <Typography variant="h4" fontWeight="bold">
                Submissions
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {course?.title} ({course?.code})
            </Typography>
          </Box>
          {selectedSubmissions.length > 0 && (
            <Button
              variant="contained"
              startIcon={<GradeIcon />}
              onClick={() => setBulkGradeDialogOpen(true)}
            >
              Grade {selectedSubmissions.length} Selected
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Card>
          <CardContent>
            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Task</InputLabel>
                <Select
                  value={taskFilter}
                  label="Filter by Task"
                  onChange={(e) => setTaskFilter(e.target.value)}
                >
                  <MenuItem value="">All Tasks</MenuItem>
                  {tasks?.map((task: any) => (
                    <MenuItem key={task.id} value={task.id}>
                      {task.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="GRADED">Graded</MenuItem>
                </Select>
              </FormControl>

              {(taskFilter || statusFilter || studentFilter) && (
                <Button
                  size="small"
                  onClick={() => {
                    setTaskFilter('');
                    setStatusFilter('');
                    setStudentFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Statistics */}
        {submissions && submissions.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Submissions
                </Typography>
                <Typography variant="h4">{submissions.length}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Needs Grading
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {submissions.filter(s => s.status === 'COMPLETED').length}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Graded
                </Typography>
                <Typography variant="h4" color="success.main">
                  {submissions.filter(s => s.status === 'GRADED').length}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Average Grade
                </Typography>
                <Typography variant="h4">
                  {submissions.filter(s => s.points !== null).length > 0
                    ? (submissions
                        .filter(s => s.points !== null)
                        .reduce((sum, s) => sum + (s.points || 0), 0) /
                        submissions.filter(s => s.points !== null).length
                      ).toFixed(1)
                    : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Submissions Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={submissions?.length > 0 && selectedSubmissions.length === submissions?.length}
                      indeterminate={selectedSubmissions.length > 0 && selectedSubmissions.length < (submissions?.length || 0)}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Task</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!submissions || submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" py={4}>
                        No submissions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission) => (
                    <TableRow
                      key={submission.id}
                      hover
                      selected={selectedSubmissions.includes(submission.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedSubmissions.includes(submission.id)}
                          onChange={() => handleSelectOne(submission.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {submission.student.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {submission.student.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{submission.task.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {submission.task.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={submission.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(submission.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={submission.progress}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">{submission.progress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(submission.submittedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {submission.points !== null ? (
                          <Box>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {submission.points}
                              {submission.task.maxPoints && ` / ${submission.task.maxPoints}`}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not graded
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Grade Submission">
                          <IconButton size="small" onClick={() => handleGrade(submission)}>
                            <GradeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      {/* Grade Single Submission Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent>
          {currentSubmission && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Student</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentSubmission.student.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Task</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentSubmission.task.title}
                </Typography>
              </Box>
              <TextField
                label="Points"
                type="number"
                fullWidth
                value={gradeForm.points}
                onChange={(e) => setGradeForm({ ...gradeForm, points: e.target.value })}
                helperText={currentSubmission.task.maxPoints ? `Max: ${currentSubmission.task.maxPoints}` : ''}
              />
              <TextField
                label="Feedback"
                multiline
                rows={4}
                fullWidth
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitGrade}
            variant="contained"
            disabled={gradeMutation.isPending}
          >
            {gradeMutation.isPending ? 'Grading...' : 'Grade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Grade Dialog */}
      <Dialog open={bulkGradeDialogOpen} onClose={() => setBulkGradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Grade {selectedSubmissions.length} Submissions</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              This will apply the same grade and feedback to all selected submissions.
            </Alert>
            <TextField
              label="Points"
              type="number"
              fullWidth
              value={bulkGradeForm.points}
              onChange={(e) => setBulkGradeForm({ ...bulkGradeForm, points: e.target.value })}
            />
            <TextField
              label="Feedback"
              multiline
              rows={4}
              fullWidth
              value={bulkGradeForm.feedback}
              onChange={(e) => setBulkGradeForm({ ...bulkGradeForm, feedback: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkGradeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBulkGrade}
            variant="contained"
            disabled={bulkGradeMutation.isPending}
          >
            {bulkGradeMutation.isPending ? 'Grading...' : 'Grade All'}
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
