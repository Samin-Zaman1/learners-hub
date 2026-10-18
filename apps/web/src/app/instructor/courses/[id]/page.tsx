'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Publish,
  Drafts as Draft,
  Archive,
  People,
  PersonAdd,
  MoreVert,
  Assignment,
  VideoLibrary,
  PictureAsPdf,
  Download,
  Visibility,
  ExpandMore,
  Analytics,
  Class,
  ContentCopy,
  Refresh,
  Share,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../../components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: 'DRAFT' | 'ASSIGNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  enrolledStudents: number;
  totalModules: number;
  totalMaterials: number;
  createdAt: string;
  lastUpdated: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  materials: CourseMaterial[];
}

interface CourseMaterial {
  id: string;
  name: string;
  type: 'PDF' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT';
  size: number;
  url: string;
  uploadedAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledAt: string;
  progress: number;
  lastActive: string;
}

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
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export default function InstructorCourseDetail({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch course data
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['instructor-course', params.id],
    queryFn: () => apiClient.get(`/instructor/courses/${params.id}`).then(res => res.data)
  });

  // Fetch invitation code
  const { data: invitationData, isLoading: codeLoading, error: codeError } = useQuery({
    queryKey: ['invitation-code', params.id],
    queryFn: () => apiClient.get(`/instructor/courses/${params.id}/invitation-code`).then(res => res.data),
    retry: false
  });

  // Fetch enrolled students
  const { data: enrolledStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['enrolled-students', params.id],
    queryFn: () => apiClient.get(`/instructor/courses/${params.id}/students`).then(res => res.data)
  });

  // Generate invitation code mutation
  const generateCodeMutation = useMutation({
    mutationFn: () => apiClient.post(`/instructor/courses/${params.id}/generate-code`),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['invitation-code', params.id] });
      setSnackbarMessage('Invitation code generated successfully!');
    },
    onError: (error: any) => {
      setSnackbarMessage(error.response?.data?.message || 'Failed to generate code');
    }
  });

  // Publish course to students mutation
  const publishCourseMutation = useMutation({
    mutationFn: () => apiClient.patch(`/instructor/courses/${params.id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', params.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      setSnackbarMessage('Course published to students successfully!');
      setPublishDialogOpen(false);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.response?.data?.message || 'Failed to publish course');
    }
  });

  // Unpublish course mutation
  const unpublishCourseMutation = useMutation({
    mutationFn: () => apiClient.post(`/instructor/courses/${params.id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', params.id] });
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      setSnackbarMessage('Course unpublished successfully!');
    },
    onError: (error: any) => {
      setSnackbarMessage(error.response?.data?.message || 'Failed to unpublish course');
    }
  });

  // Invite student mutation
  const inviteStudentMutation = useMutation({
    mutationFn: (email: string) => apiClient.post(`/instructor/courses/${params.id}/invite-student`, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolled-students', params.id] });
      setSnackbarMessage('Student invited successfully!');
      setInviteDialogOpen(false);
      setInviteEmail('');
    },
    onError: (error: any) => {
      setSnackbarMessage(error.response?.data?.message || 'Failed to invite student');
    }
  });

  // Remove student mutation
  const removeStudentMutation = useMutation({
    mutationFn: (studentId: string) => 
      apiClient.delete(`/instructor/courses/${params.id}/students/${studentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolled-students', params.id] });
      setSnackbarMessage('Student removed successfully');
    },
    onError: () => {
      setSnackbarMessage('Failed to remove student');
    }
  });

  const handleCopyCode = () => {
    if (invitationData?.invitationCode) {
      navigator.clipboard.writeText(invitationData.invitationCode);
      setSnackbarMessage('Invitation code copied to clipboard!');
    }
  };

  const handleGenerateCode = () => {
    generateCodeMutation.mutate();
  };

  const handleRemoveStudent = (studentId: string) => {
    if (confirm('Are you sure you want to remove this student from the course?')) {
      removeStudentMutation.mutate(studentId);
    }
  };

  if (courseLoading) {
    return (
      <DashboardLayout title="Loading...">
        <Box sx={{ p: 3 }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout title="Course Not Found">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Course not found</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  const modules: CourseModule[] = [
    {
      id: '1',
      title: 'Introduction to React',
      description: 'Getting started with React development',
      materials: [
        {
          id: '1',
          name: 'React Basics.pdf',
          type: 'PDF',
          size: 2048000,
          url: '/materials/react-basics.pdf',
          uploadedAt: '2024-01-10',
        },
        {
          id: '2',
          name: 'React Tutorial Video.mp4',
          type: 'VIDEO',
          size: 104857600,
          url: '/materials/react-tutorial.mp4',
          uploadedAt: '2024-01-10',
        },
      ],
    },
    {
      id: '2',
      title: 'Components and JSX',
      description: 'Understanding React components and JSX syntax',
      materials: [
        {
          id: '3',
          name: 'Components Guide.pdf',
          type: 'PDF',
          size: 1536000,
          url: '/materials/components-guide.pdf',
          uploadedAt: '2024-01-12',
        },
      ],
    },
  ];

  const students: Student[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: '/api/placeholder/32/32',
      enrolledAt: '2024-01-10',
      progress: 75,
      lastActive: '2024-01-20',
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      avatar: '/api/placeholder/32/32',
      enrolledAt: '2024-01-12',
      progress: 50,
      lastActive: '2024-01-19',
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleInviteStudent = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inviteEmail.trim()) {
      setSnackbarMessage('Please enter an email address');
      return;
    }
    if (!emailRegex.test(inviteEmail)) {
      setSnackbarMessage('Please enter a valid email address');
      return;
    }
    // Call the mutation with the email
    inviteStudentMutation.mutate(inviteEmail);
  };

  const handlePublishCourse = () => {
    if (course?.status === 'ASSIGNED') {
      publishCourseMutation.mutate();
    }
    setPublishDialogOpen(false);
  };

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'ASSIGNED':
        return 'info';
      case 'DRAFT':
        return 'warning';
      case 'COMPLETED':
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Course['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Publish />;
      case 'ASSIGNED':
        return <Class />;
      case 'DRAFT':
        return <Draft />;
      case 'COMPLETED':
      case 'ARCHIVED':
        return <Archive />;
      default:
        return <Draft />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMaterialIcon = (type: CourseMaterial['type']) => {
    switch (type) {
      case 'PDF':
        return <PictureAsPdf color="error" />;
      case 'VIDEO':
        return <VideoLibrary color="primary" />;
      case 'AUDIO':
        return <Assignment color="info" />;
      default:
        return <Assignment />;
    }
  };

  return (
    <DashboardLayout title={`Course: ${course.title}`}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => window.history.back()}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                {course.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Chip
                  icon={getStatusIcon(course.status)}
                  label={course.status}
                  color={getStatusColor(course.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date(course.lastUpdated).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              href={`/instructor/courses/${course.id}/edit`}
            >
              Edit
            </Button>
            {course.status === 'ASSIGNED' && (
              <Button
                variant="contained"
                startIcon={<Publish />}
                onClick={() => setPublishDialogOpen(true)}
                color="success"
              >
                Publish to Students
              </Button>
            )}
            {course.status === 'DRAFT' && (
              <Chip 
                label="Waiting for Admin Approval" 
                color="warning" 
                size="small"
              />
            )}
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Course Stats */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People color="primary" />
                <Box>
                  <Typography variant="h6">{enrolledStudents.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enrolled Students
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment color="info" />
                <Box>
                  <Typography variant="h6">{course._count?.modules || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Course Modules
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <VideoLibrary color="success" />
                <Box>
                  <Typography variant="h6">{course._count?.materials || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Course Materials
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Course Content" />
            <Tab label="Students" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          {/* Overview */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Description
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {course.description}
                </Typography>
              </CardContent>
            </Card>

            {/* Invitation Code Card */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Invitation Code
                  </Typography>
                  {!codeError && invitationData?.invitationCode && (
                    <Chip 
                      icon={<Share />} 
                      label="Published" 
                      color="success" 
                      size="small" 
                    />
                  )}
                </Box>
                
                {codeLoading ? (
                  <LinearProgress />
                ) : codeError ? (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No invitation code generated yet. Generate one to allow students to enroll in this course.
                    </Alert>
                    <Button
                      variant="contained"
                      startIcon={<Refresh />}
                      onClick={handleGenerateCode}
                      disabled={generateCodeMutation.isPending}
                    >
                      Generate Invitation Code
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Share this code with students to let them enroll in your course.
                    </Alert>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      p: 2, 
                      bgcolor: '#f5f5f5', 
                      borderRadius: 1,
                      mb: 2
                    }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          letterSpacing: 4,
                          color: '#667eea',
                          fontWeight: 'bold'
                        }}
                      >
                        {invitationData.invitationCode}
                      </Typography>
                      <IconButton 
                        onClick={handleCopyCode} 
                        color="primary"
                        sx={{ ml: 'auto' }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleGenerateCode}
                        disabled={generateCodeMutation.isPending}
                      >
                        Regenerate Code
                      </Button>
                      <Button
                        variant="text"
                        startIcon={<ContentCopy />}
                        onClick={handleCopyCode}
                      >
                        Copy Code
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Category:</Typography>
                    <Typography color="text.secondary">{course.category}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Status:</Typography>
                    <Chip
                      icon={getStatusIcon(course.status)}
                      label={course.status}
                      color={getStatusColor(course.status)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Created:</Typography>
                    <Typography color="text.secondary">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Last Updated:</Typography>
                    <Typography color="text.secondary">
                      {new Date(course.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {/* Course Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {modules.map((module, index) => (
              <Accordion key={module.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    Module {index + 1}: {module.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {module.description}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Materials ({module.materials.length})
                  </Typography>
                  <List>
                    {module.materials.map((material) => (
                      <ListItem key={material.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'transparent' }}>
                            {getMaterialIcon(material.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={material.name}
                          secondary={`${material.type} • ${formatFileSize(material.size)} • ${new Date(material.uploadedAt).toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton href={material.url} target="_blank">
                            <Download />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
            {modules.length === 0 && (
              <Alert severity="info">
                No course modules added yet. Edit the course to add content.
              </Alert>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {/* Students */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Enrolled Students ({enrolledStudents.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share the invitation code to add more students
              </Typography>
            </Box>
            
            {studentsLoading ? (
              <Box sx={{ p: 3 }}>
                <LinearProgress />
              </Box>
            ) : (
              <Card>
                <List>
                  {enrolledStudents.map((enrollment: any, index: number) => (
                    <React.Fragment key={enrollment.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>{enrollment.student.email[0].toUpperCase()}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={enrollment.student.email}
                          secondary={`Enrolled: ${new Date(enrollment.enrolledAt).toLocaleDateString()} • Status: ${enrollment.status}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveStudent(enrollment.student.id)}
                            disabled={removeStudentMutation.isPending}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < enrolledStudents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {enrolledStudents.length === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No students enrolled yet. Share your invitation code to get started.
                    </Typography>
                  </Box>
                )}
              </Card>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {/* Analytics */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Analytics
                </Typography>
                <Alert severity="info">
                  Analytics dashboard will be implemented here with charts showing student engagement, completion rates, and performance metrics.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Menus and Dialogs */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Archive sx={{ mr: 1 }} />
            Archive Course
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete Course
          </MenuItem>
        </Menu>

        {/* Invite Student Dialog */}
        <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
          <DialogTitle>Invite Student</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Student Email or ID"
              type="email"
              fullWidth
              variant="outlined"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleInviteStudent}
              variant="contained"
              disabled={!inviteEmail.trim()}
            >
              Send Invite
            </Button>
          </DialogActions>
        </Dialog>

        {/* Publish Course Dialog */}
        <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)}>
          <DialogTitle>Publish Course</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to publish this course? Once published, students will be able to enroll and access the course content.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePublishCourse} variant="contained">
              Publish Course
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for messages */}
        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={3000}
          onClose={() => setSnackbarMessage('')}
          message={snackbarMessage}
        />
      </Box>
    </DashboardLayout>
  );
}