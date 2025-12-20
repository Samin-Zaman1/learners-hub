'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  School,
  Check,
  Close,
  InfoOutlined,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function EnrollCoursePage() {
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [coursePreview, setCoursePreview] = useState<any>(null);
  const [error, setError] = useState('');

  // Preview course by code
  const previewMutation = useMutation({
    mutationFn: (code: string) => apiClient.get(`/courses/preview/${code}`).then(res => res.data),
    onSuccess: (data) => {
      setCoursePreview(data);
      setPreviewDialogOpen(true);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Invalid invitation code');
      setCoursePreview(null);
    }
  });

  // Enroll in course
  const enrollMutation = useMutation({
    mutationFn: (code: string) => apiClient.post('/courses/enroll', { invitationCode: code }),
    onSuccess: (response) => {
      setPreviewDialogOpen(false);
      router.push('/courses');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    }
  });

  const handlePreview = () => {
    if (!invitationCode.trim()) {
      setError('Please enter an invitation code');
      return;
    }
    previewMutation.mutate(invitationCode.trim().toUpperCase());
  };

  const handleEnroll = () => {
    enrollMutation.mutate(invitationCode.trim().toUpperCase());
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInvitationCode(value);
    setError('');
  };

  return (
    <DashboardLayout title="Enroll in Course">
      <Box sx={{ flexGrow: 1, p: 3, maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <School sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Enroll in a Course
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter the invitation code provided by your instructor to join their course
          </Typography>
        </Box>

        {/* Invitation Code Input */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Enter Invitation Code
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The code format is XXXX-XXXX (e.g., AB3X-9K2M)
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                placeholder="XXXX-XXXX"
                value={invitationCode}
                onChange={handleCodeChange}
                error={!!error}
                helperText={error}
                inputProps={{
                  maxLength: 9,
                  style: {
                    fontSize: '1.5rem',
                    fontFamily: 'monospace',
                    letterSpacing: 4,
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handlePreview}
                disabled={previewMutation.isPending || !invitationCode.trim()}
                sx={{ minWidth: 120, height: 56 }}
              >
                {previewMutation.isPending ? 'Checking...' : 'Preview'}
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>How to get an invitation code:</strong><br />
                1. Ask your instructor for the course invitation code<br />
                2. The instructor will share it via email, message, or in class<br />
                3. Enter the code here to preview and enroll in the course
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Course Preview Dialog */}
        <Dialog 
          open={previewDialogOpen} 
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Course Preview
          </DialogTitle>
          <DialogContent>
            {coursePreview && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Course Title */}
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {coursePreview.title}
                  </Typography>
                  <Chip 
                    label={coursePreview.code} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`${coursePreview.credits} Credits`} 
                    size="small" 
                  />
                </Box>

                <Divider />

                {/* Description */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {coursePreview.description || 'No description available'}
                  </Typography>
                </Box>

                {/* Instructor */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Instructor
                  </Typography>
                  <Typography variant="body1">
                    {coursePreview.instructor?.email || 'N/A'}
                  </Typography>
                </Box>

                {/* Course Details */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Semester
                    </Typography>
                    <Typography variant="body1">
                      {coursePreview.semester}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Level
                    </Typography>
                    <Typography variant="body1">
                      {coursePreview.level}
                    </Typography>
                  </Box>
                </Box>

                {/* Enrollment Info */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Enrollment
                  </Typography>
                  <Typography variant="body1">
                    {coursePreview.enrollmentCount} students enrolled
                    {coursePreview.maxEnrollments && ` / ${coursePreview.maxEnrollments} max`}
                  </Typography>
                </Box>

                {/* Course Content */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Course Content
                  </Typography>
                  <Typography variant="body2">
                    • {coursePreview.moduleCount} modules<br />
                    • {coursePreview.materialCount} learning materials
                  </Typography>
                </Box>

                {enrollMutation.isError && (
                  <Alert severity="error">
                    {error || 'Failed to enroll. Please try again.'}
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setPreviewDialogOpen(false)}
              disabled={enrollMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEnroll} 
              variant="contained"
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
