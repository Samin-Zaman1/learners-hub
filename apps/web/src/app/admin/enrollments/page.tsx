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
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Enrollment {
  id: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    title: string;
    code: string;
  };
  enrolledAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  progress: number;
}

export default function EnrollmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Fetch enrollments from API
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => api.get('/admin/enrollments').then(res => res.data),
  });

  // Filter enrollments based on search and status
  const filteredEnrollments = (enrollments as Enrollment[]).filter((enrollment) => {
    const studentName = `${enrollment.student?.firstName} ${enrollment.student?.lastName}`.toLowerCase();
    const matchesSearch =
      studentName.includes(searchQuery.toLowerCase()) ||
      enrollment.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.course?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const paginatedEnrollments = filteredEnrollments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, enrollment: Enrollment) => {
    setAnchorEl(event.currentTarget);
    setSelectedEnrollment(enrollment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEnrollment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'primary';
      case 'DROPPED':
        return 'error';
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
            Enrollment Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage student enrollments across all courses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none' }}
        >
          Add Enrollment
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2 }}>
          <TextField
            placeholder="Search by student name, course title or code..."
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
            {['ALL', 'ACTIVE', 'COMPLETED', 'DROPPED'].map((status) => (
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

      {/* Enrollments Table */}
      <Paper sx={{ boxShadow: 2 }}>
        {/* Table Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 1fr 1fr auto' },
            gap: 2,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#f9fafb',
            fontWeight: 'bold',
          }}
        >
          <Typography variant="body2" fontWeight="bold">Student</Typography>
          <Typography variant="body2" fontWeight="bold">Course</Typography>
          <Typography variant="body2" fontWeight="bold">Status</Typography>
          <Typography variant="body2" fontWeight="bold">Enrolled</Typography>
          <Typography variant="body2" fontWeight="bold">Actions</Typography>
        </Box>

        {/* Table Body */}
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading enrollments...</Typography>
          </Box>
        ) : paginatedEnrollments.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No enrollments found</Typography>
          </Box>
        ) : (
          paginatedEnrollments.map((enrollment) => (
            <Box
              key={enrollment.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 1fr 1fr auto' },
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
                <Avatar sx={{ width: 32, height: 32 }}>
                  {enrollment.student?.firstName?.charAt(0).toUpperCase() || 'S'}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="500">
                    {enrollment.student
                      ? `${enrollment.student.firstName} ${enrollment.student.lastName}`
                      : 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {enrollment.student?.email}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2">
                <strong>{enrollment.course?.code}</strong> - {enrollment.course?.title}
              </Typography>
              <Chip
                label={enrollment.status || 'ACTIVE'}
                color={getStatusColor(enrollment.status || 'ACTIVE') as any}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, enrollment)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          ))
        )}

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredEnrollments.length}
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
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Change Status</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Remove Enrollment
        </MenuItem>
      </Menu>
    </Box>
  );
}
