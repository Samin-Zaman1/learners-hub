'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  Person,
  Lock,
  Analytics,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  PhotoCamera,
  School,
  Assignment,
  EmojiEvents,
  Group,
} from '@mui/icons-material';
import { DashboardLayout, PageHeader } from '../../components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.get('/auth/profile').then(res => res.data)
  });

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        profileImage: profile.profileImage || ''
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: unknown) => apiClient.patch('/auth/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSnackbarMessage('Profile updated successfully!');
      setEditMode(false);
    },
    onError: (error: unknown) => {
      setSnackbarMessage(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: unknown) => apiClient.post('/auth/change-password', data),
    onSuccess: () => {
      setSnackbarMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: unknown) => {
      setSnackbarMessage(error.response?.data?.message || 'Failed to change password');
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset form
      setProfileForm({
        firstName: (profile as unknown as { firstName?: string })?.firstName || '',
        lastName: (profile as unknown as { lastName?: string })?.lastName || '',
        email: (profile as unknown as { email?: string })?.email || '',
        profileImage: (profile as unknown as { profileImage?: string })?.profileImage || ''
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbarMessage('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSnackbarMessage('Password must be at least 6 characters long');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  if (profileLoading) {
    return (
      <DashboardLayout title="Profile">
        <Box sx={{ p: 3 }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const stats = (profile as unknown as { stats?: unknown })?.stats || {};
  const isStudent = (profile as unknown as { role?: string })?.role === 'STUDENT';
  const isInstructor = (profile as unknown as { role?: string })?.role === 'INSTRUCTOR';

  return (
    <DashboardLayout title="Profile">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <PageHeader
          title="My Profile"
          description="Manage your account settings and preferences"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Profile' }
          ]}
        />

        {/* Profile Header Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem'
                  }}
                  src={profileForm.profileImage}
                >
                  {profileForm.firstName?.[0] || profileForm.email?.[0]?.toUpperCase()}
                </Avatar>
                {editMode && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    size="small"
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {profileForm.firstName} {profileForm.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {profileForm.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      bgcolor: (profile as unknown as { role?: string })?.role === 'INSTRUCTOR' ? 'success.main' : 'primary.main',
                      color: 'white',
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {(profile as unknown as { role?: string })?.role}
                  </Box>
                  {(profile as unknown as { verified?: boolean })?.verified && (
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        bgcolor: 'success.light',
                        color: 'success.dark',
                        borderRadius: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      Verified
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab icon={<Person />} label="Personal Info" iconPosition="start" />
            <Tab icon={<Lock />} label="Password" iconPosition="start" />
            <Tab icon={<Analytics />} label="Statistics" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Personal Info Tab */}
        <TabPanel value={currentTab} index={0}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Personal Information</Typography>
                <Box>
                  {editMode ? (
                    <>
                      <Button
                        startIcon={<Cancel />}
                        onClick={handleEditToggle}
                        sx={{ mr: 1 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        startIcon={<Save />}
                        variant="contained"
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      startIcon={<Edit />}
                      variant="outlined"
                      onClick={handleEditToggle}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Box>

              <Box className="form-container">
                <TextField
                  label="First Name"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  fullWidth
                  disabled={!editMode}
                />
                <TextField
                  label="Last Name"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  fullWidth
                  disabled={!editMode}
                />

                <TextField
                  label="Email Address"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  fullWidth
                  disabled={!editMode}
                  className="form-full-width"
                />

                <TextField
                  label="Profile Image URL"
                  value={profileForm.profileImage}
                  onChange={(e) => setProfileForm({ ...profileForm, profileImage: e.target.value })}
                  fullWidth
                  disabled={!editMode}
                  helperText="Enter a URL to your profile picture"
                  className="form-full-width"
                />

                <Divider />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Member since: {new Date((profile as unknown as { createdAt?: string })?.createdAt ?? '').toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Account Type: {(profile as unknown as { role?: string })?.role}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Password Tab */}
        <TabPanel value={currentTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your current password and choose a new password
              </Typography>

              <Box className="form-container-narrow">
                <TextField
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  fullWidth
                  helperText="Must be at least 6 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  fullWidth
                  error={passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword}
                  helperText={
                    passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword ||
                    passwordForm.newPassword !== passwordForm.confirmPassword ||
                    changePasswordMutation.isPending
                  }
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
            {isStudent && (
              <>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <School />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.enrolledCourses || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Enrolled Courses
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                        <Assignment />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.completedAssignments || 0} / {stats.totalAssignments || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed Assignments
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                        <EmojiEvents />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.averageGrade || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Grade
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}

            {isInstructor && (
              <>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <School />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.totalCourses || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Courses
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                        <Group />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.totalStudents || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Students
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                        <Assignment />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.totalTasks || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Assignments
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}
          </Box>
        </TabPanel>

        {/* Snackbar */}
        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={4000}
          onClose={() => setSnackbarMessage('')}
          message={snackbarMessage}
        />
      </Box>
    </DashboardLayout>
  );
}
