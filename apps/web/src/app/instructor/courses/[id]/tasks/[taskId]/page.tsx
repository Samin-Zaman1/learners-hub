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
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { ArrowBack as BackIcon, Grade as GradeIcon } from '@mui/icons-material';
import { api } from '@/lib/api';

interface Submission {
  id: string;
  student: {
    id: string;
    email: string;
    name: string;
  };
  status: string;
  progress: number;
  submittedAt: string | null;
  grade: string | null;
  points: number | null;
  feedback: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  dueDate: string;
  dueTime: string | null;
  maxPoints: number | null;
  estimatedTime: string | null;
  createdAt: string;
}

export default function TaskSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;
  const taskId = params.taskId as string;

  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', points: '', feedback: '' });
  const [error, setError] = useState('');

  const { data: task, isLoading: taskLoading } = useQuery<Task>({
    queryKey: ['instructor', 'courses', courseId, 'tasks', taskId],
    queryFn: async () => {
      const response = await api.get(`/instructor/courses/${courseId}/tasks/${taskId}`);
      return response.data;
    }
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: ['instructor', 'courses', courseId, 'tasks', taskId, 'submissions'],
    queryFn: async () => {
      const response = await api.get(`/instructor/courses/${courseId}/tasks/${taskId}/submissions`);
      return response.data;
    }
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ submissionId, gradeData }: any) => {
      const response = await api.patch(
        `/instructor/courses/${courseId}/tasks/${taskId}/submissions/${submissionId}`,
        gradeData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['instructor', 'courses', courseId, 'tasks', taskId, 'submissions'] 
      });
      setGradeDialogOpen(false);
      setSelectedSubmission(null);
      setGradeForm({ grade: '', points: '', feedback: '' });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit grade');
    }
  });

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade || '',
      points: submission.points?.toString() || '',
      feedback: submission.feedback || ''
    });
    setGradeDialogOpen(true);
    setError('');
  };

  const handleGradeSubmit = () => {
    if (!selectedSubmission) return;

    gradeMutation.mutate({
      submissionId: selectedSubmission.id,
      gradeData: {
        grade: gradeForm.grade || undefined,
        points: gradeForm.points ? parseInt(gradeForm.points) : undefined,
        feedback: gradeForm.feedback || undefined
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'default';
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'warning';
      case 'GRADED':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not submitted';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (taskLoading || submissionsLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  const stats = submissions?.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push(`/instructor/courses/${courseId}/tasks`)}
            sx={{ mb: 2 }}
          >
            Back to Tasks
          </Button>
          <Typography variant="h4" fontWeight="bold">
            {task?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Due: {task && formatDate(task.dueDate)}
            {task?.maxPoints && ` • ${task.maxPoints} points possible`}
          </Typography>
        </Box>

        {/* Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total
              </Typography>
              <Typography variant="h4">
                {submissions?.length || 0}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4">
                {stats.PENDING || 0}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Submitted
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.COMPLETED || 0}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Graded
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.GRADED || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Submissions Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Student Submissions
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions?.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {submission.student.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {submission.student.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={submission.status}
                          size="small"
                          color={getStatusColor(submission.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={submission.progress}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">
                            {submission.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(submission.submittedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {submission.grade || '-'}
                      </TableCell>
                      <TableCell>
                        {submission.points !== null ? (
                          <Typography fontWeight="medium">
                            {submission.points}/{task?.maxPoints || 0}
                          </Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant={submission.status === 'COMPLETED' ? 'contained' : 'outlined'}
                          startIcon={<GradeIcon />}
                          onClick={() => openGradeDialog(submission)}
                          disabled={submission.status === 'PENDING'}
                        >
                          {submission.status === 'GRADED' ? 'Update' : 'Grade'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Grade Submission - {selectedSubmission?.student.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Letter Grade"
              fullWidth
              value={gradeForm.grade}
              onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
              placeholder="A, B+, C, etc."
            />

            <TextField
              label="Points"
              type="number"
              fullWidth
              value={gradeForm.points}
              onChange={(e) => setGradeForm(prev => ({ ...prev, points: e.target.value }))}
              placeholder={`Out of ${task?.maxPoints || 0}`}
              inputProps={{ min: 0, max: task?.maxPoints || 100 }}
            />

            <TextField
              label="Feedback"
              fullWidth
              multiline
              rows={4}
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
              placeholder="Provide feedback to the student..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)} disabled={gradeMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleGradeSubmit}
            variant="contained"
            disabled={gradeMutation.isPending || (!gradeForm.grade && !gradeForm.points)}
          >
            {gradeMutation.isPending ? 'Submitting...' : 'Submit Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
