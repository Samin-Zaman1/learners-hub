'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  IconButton,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Analytics as AnalyticsIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components';
import RoleGuard from '../../components/shared/RoleGuard';
import { useInstructorCourses } from '../../hooks/useInstructorCourses';

interface Course {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  enrolledStudents: number;
  totalLessons: number;
  completedLessons: number;
  lastUpdated: string;
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
      id={`instructor-tabpanel-${index}`}
      aria-labelledby={`instructor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function InstructorDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const { courses: apiCourses, stats, loading, error } = useInstructorCourses();
  
  // Map API courses to component format
  const courses: Course[] = apiCourses.map((course: any) => ({
    id: course.id,
    title: course.title,
    description: course.description || 'No description',
    status: course.status,
    enrolledStudents: course._count?.enrollments || 0,
    totalLessons: 0,
    completedLessons: 0,
    lastUpdated: new Date(course.updatedAt).toISOString().split('T')[0],
  }));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateCourse = () => {
    // Navigate to course creation wizard
    window.location.href = '/instructor/courses/create';
  };

  const handleViewCourse = (courseId: string) => {
    window.location.href = `/instructor/courses/${courseId}`;
  };

  const handleEditCourse = (courseId: string) => {
    window.location.href = `/instructor/courses/${courseId}/edit`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Instructor Dashboard">
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Instructor Dashboard">
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          Error loading instructor dashboard: {error}
        </Typography>
      </DashboardLayout>
    );
  }

  return (
    <RoleGuard allowedRoles={['INSTRUCTOR']}>
      <DashboardLayout title="Instructor Dashboard">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Instructor Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your courses, students, and track progress
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats?.totalCourses || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Courses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon color="secondary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats?.totalStudents || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Students
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats?.activeAssignments || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Assignments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AnalyticsIcon color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {stats?.averageGrade ? `${stats.averageGrade}%` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Grade
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Main Content */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="My Courses" />
              <Tab label="Students" />
              <Tab label="Analytics" />
              <Tab label="Settings" />
            </Tabs>
          </Box>

          {/* Courses Tab */}
          <TabPanel value={currentTab} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">My Courses</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateCourse}
              >
                Create Course
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {courses.map((course: Course) => (
                <Box key={course.id} sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: { xs: '100%', sm: '48%', md: '32%' } }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {course.description}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Status:
                        </Typography>
                        <Typography
                          variant="body2"
                          color={course.status === 'PUBLISHED' ? 'success.main' : 'warning.main'}
                        >
                          {course.status}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {course.enrolledStudents || 0} students
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewCourse(course.id)}
                          title="View Course"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditCourse(course.id)}
                          title="Edit Course"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Delete Course"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>

            {courses.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No courses yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first course to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCourse}
                >
                  Create Course
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Students Tab */}
          <TabPanel value={currentTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Student Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage students across all your courses
            </Typography>
            {/* TODO: Implement student management interface */}
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={currentTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Course Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track student progress and course performance
            </Typography>
            {/* TODO: Implement analytics dashboard */}
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={currentTab} index={3}>
            <Typography variant="h6" gutterBottom>
              Instructor Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your instructor profile and preferences
            </Typography>
            {/* TODO: Implement settings interface */}
          </TabPanel>
        </Paper>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateCourse}
        >
          <AddIcon />
        </Fab>
      </Box>
    </DashboardLayout>
    </RoleGuard>
  );
}