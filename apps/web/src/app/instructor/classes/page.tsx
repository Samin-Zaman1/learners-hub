'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  Divider,
  Alert,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  VideoCall,
  People,
  Schedule,
  MoreVert,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  Circle as Record,
  Settings,
  Link as LinkIcon,
  ContentCopy,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../components';

// Simple date/time input components since @mui/x-date-pickers isn't available

interface Class {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  scheduledTime: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  attendees: number;
  maxAttendees: number;
  meetingLink: string;
  recordingUrl?: string;
  type: 'lecture' | 'discussion' | 'workshop' | 'exam';
}

interface Course {
  id: string;
  title: string;
  enrolledStudents: number;
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
      id={`classes-tabpanel-${index}`}
      aria-labelledby={`classes-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ClassesManagement() {
  const [currentTab, setCurrentTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const [classForm, setClassForm] = useState({
    title: '',
    description: '',
    courseId: '',
    scheduledTime: new Date(),
    duration: 60,
    maxAttendees: 50,
    type: 'lecture' as Class['type'],
  });

  // Mock data - replace with actual API calls
  const courses: Course[] = [
    { id: '1', title: 'React Fundamentals', enrolledStudents: 24 },
    { id: '2', title: 'Advanced JavaScript', enrolledStudents: 18 },
    { id: '3', title: 'Node.js Backend', enrolledStudents: 15 },
  ];

  const classes: Class[] = [
    {
      id: '1',
      title: 'React Components Deep Dive',
      description: 'Comprehensive overview of React component patterns and best practices',
      courseId: '1',
      courseName: 'React Fundamentals',
      scheduledTime: new Date('2024-01-25T10:00:00'),
      duration: 90,
      status: 'scheduled',
      attendees: 0,
      maxAttendees: 50,
      meetingLink: 'https://meet.example.com/react-components-123',
      type: 'lecture',
    },
    {
      id: '2',
      title: 'JavaScript Async Programming',
      description: 'Live coding session on Promises, async/await, and event handling',
      courseId: '2',
      courseName: 'Advanced JavaScript',
      scheduledTime: new Date('2024-01-24T14:00:00'),
      duration: 120,
      status: 'live',
      attendees: 15,
      maxAttendees: 30,
      meetingLink: 'https://meet.example.com/js-async-456',
      type: 'workshop',
    },
    {
      id: '3',
      title: 'React Hooks Workshop',
      description: 'Hands-on workshop building custom hooks',
      courseId: '1',
      courseName: 'React Fundamentals',
      scheduledTime: new Date('2024-01-20T15:30:00'),
      duration: 150,
      status: 'completed',
      attendees: 22,
      maxAttendees: 25,
      meetingLink: 'https://meet.example.com/hooks-workshop-789',
      recordingUrl: 'https://recordings.example.com/hooks-workshop.mp4',
      type: 'workshop',
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateClass = () => {
    // TODO: Implement create class API call
    console.log('Creating class:', classForm);
    setCreateDialogOpen(false);
    setClassForm({
      title: '',
      description: '',
      courseId: '',
      scheduledTime: new Date(),
      duration: 60,
      maxAttendees: 50,
      type: 'lecture',
    });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, classId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedClassId(classId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClassId(null);
  };

  const getStatusColor = (status: Class['status']) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'live':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: Class['type']) => {
    switch (type) {
      case 'lecture':
        return '📚';
      case 'discussion':
        return '💬';
      case 'workshop':
        return '🔨';
      case 'exam':
        return '📝';
      default:
        return '📚';
    }
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    // TODO: Show toast notification
  };

  const getClassesByStatus = (status: Class['status']) => {
    return classes.filter(cls => cls.status === status);
  };

  const upcomingClasses = getClassesByStatus('scheduled');
  const liveClasses = getClassesByStatus('live');
  const completedClasses = getClassesByStatus('completed');

  const renderClassCard = (classItem: Class) => (
    <Card key={classItem.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2">{getTypeIcon(classItem.type)}</Typography>
              <Typography variant="h6">{classItem.title}</Typography>
              <Chip
                label={classItem.status}
                color={getStatusColor(classItem.status)}
                size="small"
              />
              {classItem.status === 'live' && (
                <Chip
                  icon={<Record />}
                  label="LIVE"
                  color="error"
                  size="small"
                  sx={{ animation: 'pulse 2s infinite' }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {classItem.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Course: {classItem.courseName}
            </Typography>
          </Box>
          <IconButton onClick={(e) => handleMenuClick(e, classItem.id)}>
            <MoreVert />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="body2">
              {classItem.scheduledTime.toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2">
              {classItem.scheduledTime.toLocaleTimeString()} ({classItem.duration}min)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People fontSize="small" color="action" />
            <Typography variant="body2">
              {classItem.attendees}/{classItem.maxAttendees}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {classItem.status === 'live' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<VideoCall />}
              href={classItem.meetingLink}
              target="_blank"
            >
              Join Live Class
            </Button>
          )}
          {classItem.status === 'scheduled' && (
            <Button
              variant="outlined"
              startIcon={<PlayArrow />}
              href={classItem.meetingLink}
              target="_blank"
            >
              Start Class
            </Button>
          )}
          {classItem.recordingUrl && (
            <Button
              variant="outlined"
              startIcon={<VideoCall />}
              href={classItem.recordingUrl}
              target="_blank"
            >
              View Recording
            </Button>
          )}
          <Button
            variant="text"
            size="small"
            startIcon={<ContentCopy />}
            onClick={() => copyMeetingLink(classItem.meetingLink)}
          >
            Copy Link
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Class Management">
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Class Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Schedule and manage live classes, workshops, and discussions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Schedule Class
            </Button>
          </Box>

          {/* Quick Stats */}
          <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
            <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule color="info" />
                  <Box>
                    <Typography variant="h6">{upcomingClasses.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming Classes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <VideoCall color="success" />
                  <Box>
                    <Typography variant="h6">{liveClasses.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Live Now
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <People color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {classes.reduce((acc, cls) => acc + cls.attendees, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Attendees
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label={`Upcoming (${upcomingClasses.length})`} />
              <Tab label={`Live (${liveClasses.length})`} />
              <Tab label={`Completed (${completedClasses.length})`} />
              <Tab label="All Classes" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={currentTab} index={0}>
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map(renderClassCard)
            ) : (
              <Alert severity="info">No upcoming classes scheduled.</Alert>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            {liveClasses.length > 0 ? (
              liveClasses.map(renderClassCard)
            ) : (
              <Alert severity="info">No classes are currently live.</Alert>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            {completedClasses.length > 0 ? (
              completedClasses.map(renderClassCard)
            ) : (
              <Alert severity="info">No completed classes yet.</Alert>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            {classes.length > 0 ? (
              classes.map(renderClassCard)
            ) : (
              <Alert severity="info">No classes scheduled yet.</Alert>
            )}
          </TabPanel>

          {/* Class Actions Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Edit sx={{ mr: 1 }} />
              Edit Class
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 1 }} />
              Class Settings
            </MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
              <Delete sx={{ mr: 1 }} />
              Cancel Class
            </MenuItem>
          </Menu>

          {/* Create Class Dialog */}
          <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Schedule New Class</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  fullWidth
                  label="Class Title"
                  value={classForm.title}
                  onChange={(e) => setClassForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={classForm.description}
                  onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <FormControl fullWidth required>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={classForm.courseId}
                    onChange={(e) => setClassForm(prev => ({ ...prev, courseId: e.target.value }))}
                    label="Course"
                  >
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.title} ({course.enrolledStudents} students)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Class Type</InputLabel>
                  <Select
                    value={classForm.type}
                    onChange={(e) => setClassForm(prev => ({ ...prev, type: e.target.value as Class['type'] }))}
                    label="Class Type"
                  >
                    <MenuItem value="lecture">📚 Lecture</MenuItem>
                    <MenuItem value="discussion">💬 Discussion</MenuItem>
                    <MenuItem value="workshop">🔨 Workshop</MenuItem>
                    <MenuItem value="exam">📝 Exam</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Scheduled Time"
                  type="datetime-local"
                  value={classForm.scheduledTime.toISOString().slice(0, 16)}
                  onChange={(e) => setClassForm(prev => ({ ...prev, scheduledTime: new Date(e.target.value) }))}
                  InputLabelProps={{ shrink: true }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    value={classForm.duration}
                    onChange={(e) => setClassForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    InputProps={{ inputProps: { min: 15, max: 300 } }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Max Attendees"
                    type="number"
                    value={classForm.maxAttendees}
                    onChange={(e) => setClassForm(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) }))}
                    InputProps={{ inputProps: { min: 1, max: 1000 } }}
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Alert severity="info">
                  A meeting link will be automatically generated when you create the class.
                </Alert>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreateClass}
                variant="contained"
                disabled={!classForm.title || !classForm.courseId}
              >
                Schedule Class
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
  );
}