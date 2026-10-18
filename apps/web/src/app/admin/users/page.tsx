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
  Avatar,
  Button,
  Menu,
  MenuItem,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getApiErrorMessage } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  createdAt: string;
  isVerified: boolean;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch users from API
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(res => res.data),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => api.post('/admin/users', userData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      handleCloseDialog();
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Failed to create user'));
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: any }) =>
      api.patch(`/admin/users/${id}`, userData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      handleCloseDialog();
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Failed to update user'));
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      handleMenuClose();
    },
  });

  const handleOpenDialog = (mode: 'create' | 'edit', user?: User) => {
    setDialogMode(mode);
    setError('');
    if (mode === 'edit' && user) {
      const [firstName, ...lastNameParts] = (user.name || '').split(' ');
      setFormData({
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: user.email || '',
        password: '',
        role: user.role,
      });
      setSelectedUser(user);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'STUDENT',
      });
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setError('');
  };

  const handleSubmit = () => {
    setError('');
    if (!formData.email || !formData.firstName) {
      setError('Email and first name are required');
      return;
    }
    
    if (dialogMode === 'create') {
      if (!formData.password) {
        setError('Password is required for new users');
        return;
      }
      createUserMutation.mutate(formData);
    } else if (selectedUser) {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      updateUserMutation.mutate({ id: selectedUser.id, userData: updateData });
    }
  };

  const handleDelete = () => {
    if (selectedUser && confirm(`Are you sure you want to delete ${selectedUser.name}?`)) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Filter users based on search and role
  const filteredUsers = (users as User[]).filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'INSTRUCTOR':
        return 'primary';
      case 'STUDENT':
        return 'success';
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
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all users in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
          sx={{ textTransform: 'none' }}
        >
          Add User
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2 }}>
          <TextField
            placeholder="Search users by name or email..."
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
            {['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'].map((role) => (
              <Chip
                key={role}
                label={role}
                onClick={() => setRoleFilter(role)}
                color={roleFilter === role ? 'primary' : 'default'}
                variant={roleFilter === role ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ boxShadow: 2 }}>
        {/* Table Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 1fr 1fr 1fr auto' },
            gap: 2,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#f9fafb',
            fontWeight: 'bold',
          }}
        >
          <Typography variant="body2" fontWeight="bold">Name</Typography>
          <Typography variant="body2" fontWeight="bold">Email</Typography>
          <Typography variant="body2" fontWeight="bold">Role</Typography>
          <Typography variant="body2" fontWeight="bold">Status</Typography>
          <Typography variant="body2" fontWeight="bold">Joined</Typography>
          <Typography variant="body2" fontWeight="bold">Actions</Typography>
        </Box>

        {/* Table Body */}
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading users...</Typography>
          </Box>
        ) : paginatedUsers.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No users found</Typography>
          </Box>
        ) : (
          paginatedUsers.map((user) => (
            <Box
              key={user.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 1fr 1fr 1fr auto' },
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
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="body2" fontWeight="500">
                  {user.name || 'N/A'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Chip
                label={user.role}
                color={getRoleColor(user.role) as any}
                size="small"
              />
              <Chip
                label={user.isVerified ? 'Verified' : 'Unverified'}
                color={user.isVerified ? 'success' : 'warning'}
                size="small"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, user)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          ))
        )}

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredUsers.length}
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
        <MenuItem onClick={() => handleOpenDialog('edit', selectedUser!)}>Edit User</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete User
        </MenuItem>
      </Menu>

      {/* Create/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label={dialogMode === 'create' ? 'Password' : 'Password (leave blank to keep current)'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required={dialogMode === 'create'}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                native
              >
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createUserMutation.isPending || updateUserMutation.isPending}
          >
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
