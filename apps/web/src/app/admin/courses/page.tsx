'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Menu,
  MenuItem,
  TablePagination,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getApiErrorMessage } from '@/lib/api';

interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
  credits?: number;
  instructorId?: string;
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'ASSIGNED';
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  enrollmentCount: number;
  createdAt: string;
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    credits: 3,
    instructorId: '',
    status: 'DRAFT',
  });
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch instructors for dropdown
  const { data: instructors = [] } = useQuery({
    queryKey: ['admin-instructors'],
    queryFn: () => api.get('/admin/users', { params: { role: 'INSTRUCTOR' } }).then(res => res.data),
  });

  // Fetch courses from API
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => api.get('/admin/courses').then(res => res.data),
  });

  // Filter courses based on search and status
  const filteredCourses = (courses as Course[]).filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const paginatedCourses = filteredCourses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, course: Course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: (courseData: any) => api.post('/admin/courses', courseData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      handleCloseDialog();
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Failed to create course'));
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, courseData }: { id: string; courseData: any }) =>
      api.patch(`/admin/courses/${id}`, courseData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      handleCloseDialog();
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Failed to update course'));
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/courses/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      handleMenuClose();
    },
  });

  // Publish to instructor mutation
  const publishToInstructorMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/admin/courses/${id}/publish-to-instructor`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      handleMenuClose();
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Failed to publish course'));
    },
  });

  const handleOpenDialog = (mode: 'create' | 'edit', course?: Course) => {
    setDialogMode(mode);
    setError('');
    if (mode === 'edit' && course) {
      setFormData({
        title: course.title || '',
        code: course.code || '',
        description: course.description || '',
        credits: course.credits || 3,
        instructorId: course.instructor?.id || '',
        status: course.status || 'DRAFT',
      });
      setSelectedCourse(course);
    } else {
      setFormData({
        title: '',
        code: '',
        description: '',
        credits: 3,
        instructorId: '',
        status: 'DRAFT',
      });
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
    setError('');
  };

  const handleSubmit = () => {
    setError('');
    if (!formData.title || !formData.code) {
      setError('Title and code are required');
      return;
    }
    
    if (dialogMode === 'create') {
      createCourseMutation.mutate(formData);
    } else if (selectedCourse) {
      updateCourseMutation.mutate({ id: selectedCourse.id, courseData: formData });
    }
  };

  const handleDelete = () => {
    if (selectedCourse && confirm(`Are you sure you want to delete ${selectedCourse.title}?`)) {
      deleteCourseMutation.mutate(selectedCourse.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'ASSIGNED':
        return 'info';
      case 'COMPLETED':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Course Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all courses in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
          sx={{ textTransform: 'none' }}
        >
          Add Course
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2 }}>
          <TextField
            placeholder="Search courses by title or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['ALL', 'ACTIVE', 'DRAFT', 'ASSIGNED', 'COMPLETED'].map((status) => (
              <Chip
                key={status}
                label={status}
                onClick={() => setStatusFilter(status)}
                color={statusFilter === status ? 'primary' : 'default'}
                variant={statusFilter === status ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Courses Table */}
      <Paper sx={{ boxShadow: 2 }}>
        {/* Table Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1.5fr 1fr 1fr auto' },
            gap: 2,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#f9fafb',
            fontWeight: 'bold',
          }}
        >
          <Typography variant="body2" fontWeight="bold">Course</Typography>
          <Typography variant="body2" fontWeight="bold">Code</Typography>
          <Typography variant="body2" fontWeight="bold">Instructor</Typography>
          <Typography variant="body2" fontWeight="bold">Status</Typography>
          <Typography variant="body2" fontWeight="bold">Enrollments</Typography>
          <Typography variant="body2" fontWeight="bold">Actions</Typography>
        </Box>

        {/* Table Body */}
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading courses...</Typography>
          </Box>
        ) : paginatedCourses.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No courses found</Typography>
          </Box>
        ) : (
          paginatedCourses.map((course) => (
            <Box
              key={course.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1.5fr 1fr 1fr auto' },
                gap: 2,
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <SchoolIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="body2" fontWeight="500">
                  {course.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {course.code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course.instructor
                  ? `${course.instructor.firstName} ${course.instructor.lastName}`
                  : 'N/A'}
              </Typography>
              <Chip
                label={course.status}
                color={getStatusColor(course.status) as any}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {course.enrollmentCount || 0} students
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, course)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          ))
        )}

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredCourses.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenDialog('edit', selectedCourse!)}>Edit Course</MenuItem>
        {selectedCourse?.status === 'DRAFT' && selectedCourse?.instructorId && (
          <MenuItem 
            onClick={() => {
              if (selectedCourse) {
                publishToInstructorMutation.mutate(selectedCourse.id);
              }
            }}
            sx={{ color: 'success.main' }}
          >
            Publish to Instructor
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete Course
        </MenuItem>
      </Menu>

      {/* Create/Edit Course Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New Course' : 'Edit Course'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              label="Course Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Course Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              fullWidth
              required
              placeholder="e.g., CS101"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Credits"
              type="number"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Instructor</InputLabel>
              <Select
                value={formData.instructorId}
                label="Instructor"
                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                native
              >
                <option value="">Select Instructor</option>
                {(instructors as any[]).map((instructor: any) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                native
              >
                <option value="DRAFT">Draft</option>
                <option value="ASSIGNED">Assigned to Instructor</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
          >
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
