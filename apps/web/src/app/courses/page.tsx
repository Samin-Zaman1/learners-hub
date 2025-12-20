'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School,
  Person,
  AccessTime,
  Assignment,
  MoreVert,
  Download,
  PlayArrow,
  Book,
  Quiz,
  Grade,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components';
import { useEnrolledCourses } from '@/hooks/useCourses';

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StudentCoursesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Fetch enrolled courses for student
  const { data: enrolledCourses, isLoading, error } = useEnrolledCourses();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, courseId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#667eea';
      case 'not-started': return '#6b7280';
      default: return '#667eea';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Courses">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Courses">
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load courses. Please try again later.
        </Alert>
      </DashboardLayout>
    );
  }

  // Mock enhanced course data with deterministic calculations
  const enhancedCourses = enrolledCourses?.map(course => {
    const courseHash = course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      ...course,
      progress: courseHash % 100,
      status: ['completed', 'in-progress', 'not-started'][courseHash % 3],
      totalLessons: (courseHash % 20) + 10,
      completedLessons: (courseHash % 15) + 1,
      nextLesson: `Lesson ${(courseHash % 10) + 1}`,
      materials: (courseHash % 25) + 5,
      assignments: (courseHash % 8) + 2,
      lastAccessed: new Date(Date.now() - (courseHash % 7) * 24 * 60 * 60 * 1000).toLocaleDateString()
    };
  }) || [];

  const activeCourses = enhancedCourses.filter(course => course.status === 'in-progress');
  const completedCourses = enhancedCourses.filter(course => course.status === 'completed');
  const allCourses = enhancedCourses;

  const renderCourseCard = (course: any) => (
    <Box key={course.id} sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: { xs: '100%', md: '48%', lg: '32%' } }}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}>
        <Box sx={{ 
          height: 8, 
          background: `linear-gradient(90deg, ${course.color} 0%, ${course.color}80 100%)` 
        }} />
        
        <CardContent sx={{ flex: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#1a1a1a' }}>
                {course.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {course.code}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={(e) => handleMenuClick(e, course.id)}
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: course.color }}>
              <Person fontSize="small" />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {course.instructor}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Progress: {course.progress}%
              </Typography>
              <Chip 
                size="small" 
                label={course.status.replace('-', ' ')}
                sx={{ 
                  bgcolor: getStatusColor(course.status) + '20',
                  color: getStatusColor(course.status),
                  textTransform: 'capitalize'
                }}
              />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={course.progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: '#f3f4f6',
                '& .MuiLinearProgress-bar': {
                  bgcolor: course.color
                }
              }} 
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Book sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {course.completedLessons}/{course.totalLessons} lessons
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {course.assignments} assignments
              </Typography>
            </Box>
          </Box>

          {course.status === 'in-progress' && (
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 2 }}>
              <Typography variant="body2" fontWeight={500} color="#374151" sx={{ mb: 0.5 }}>
                Continue Learning
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course.nextLesson}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Last accessed: {course.lastAccessed}
          </Typography>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button 
            variant="contained" 
            startIcon={course.status === 'completed' ? <Grade /> : <PlayArrow />}
            fullWidth
            sx={{ 
              bgcolor: course.color,
              '&:hover': { bgcolor: course.color + 'dd' }
            }}
          >
            {course.status === 'completed' ? 'View Certificate' : 'Continue Learning'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  return (
    <DashboardLayout title="My Courses">
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
            My Courses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continue your learning journey and track your progress
          </Typography>
        </Box>

        {/* Course Statistics */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#667eea10' }}>
              <School sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
              <Typography variant="h4" fontWeight={600} color="#667eea">
                {allCourses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Enrolled
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#10b98110' }}>
              <Grade sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
              <Typography variant="h4" fontWeight={600} color="#10b981">
                {completedCourses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#f59e0b10' }}>
              <AccessTime sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h4" fontWeight={600} color="#f59e0b">
                {activeCourses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </Card>
          </Box>
        </Box>

        {/* Course Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="course tabs">
            <Tab label={`All Courses (${allCourses.length})`} />
            <Tab label={`Active (${activeCourses.length})`} />
            <Tab label={`Completed (${completedCourses.length})`} />
          </Tabs>
        </Box>

        {/* Course Lists */}
        <TabPanel value={tabValue} index={0}>
          {allCourses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No courses enrolled yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start learning by enrolling in courses
              </Typography>
              <Button variant="contained" sx={{ bgcolor: '#667eea' }}>
                Browse Courses
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {allCourses.map(renderCourseCard)}
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {activeCourses.map(renderCourseCard)}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {completedCourses.map(renderCourseCard)}
          </Box>
        </TabPanel>

        {/* Course Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Download sx={{ mr: 1 }} fontSize="small" />
            Download Materials
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Assignment sx={{ mr: 1 }} fontSize="small" />
            View Assignments
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Quiz sx={{ mr: 1 }} fontSize="small" />
            Take Quiz
          </MenuItem>
        </Menu>
      </Box>
    </DashboardLayout>
  );
}