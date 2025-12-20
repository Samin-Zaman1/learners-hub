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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Chip,
  Alert,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  PersonAdd,
  Send,
  MoreVert,
  Search,
  Block,
  CheckCircle,
  Cancel,
  Email,
  School,
  AccessTime,
  FilterList,
} from '@mui/icons-material';
import { DashboardLayout } from '../../../components';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  studentId: string;
  enrolledCourses: number;
  totalProgress: number;
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface Invitation {
  id: string;
  email: string;
  studentId: string;
  courseId: string;
  courseName: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  sentAt: string;
  expiresAt: string;
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
      id={`students-tabpanel-${index}`}
      aria-labelledby={`students-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StudentsManagement() {
  const [currentTab, setCurrentTab] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [bulkInviteDialogOpen, setBulkInviteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    studentId: '',
    courseId: '',
    message: ''
  });
  
  const [bulkInviteEmails, setBulkInviteEmails] = useState('');

  // Mock data - replace with actual API calls
  const courses: Course[] = [
    { id: '1', title: 'React Fundamentals', enrolledStudents: 24 },
    { id: '2', title: 'Advanced JavaScript', enrolledStudents: 18 },
    { id: '3', title: 'Node.js Backend', enrolledStudents: 15 },
  ];

  const students: Student[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: '/api/placeholder/40/40',
      studentId: 'STU001',
      enrolledCourses: 2,
      totalProgress: 75,
      joinedAt: '2024-01-10',
      lastActive: '2024-01-20',
      status: 'active',
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      avatar: '/api/placeholder/40/40',
      studentId: 'STU002',
      enrolledCourses: 1,
      totalProgress: 50,
      joinedAt: '2024-01-12',
      lastActive: '2024-01-19',
      status: 'active',
    },
    {
      id: '3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      avatar: '/api/placeholder/40/40',
      studentId: 'STU003',
      enrolledCourses: 3,
      totalProgress: 90,
      joinedAt: '2024-01-08',
      lastActive: '2024-01-18',
      status: 'inactive',
    },
  ];

  const invitations: Invitation[] = [
    {
      id: '1',
      email: 'david@example.com',
      studentId: 'STU004',
      courseId: '1',
      courseName: 'React Fundamentals',
      status: 'pending',
      sentAt: '2024-01-19',
      expiresAt: '2024-01-26',
    },
    {
      id: '2',
      email: 'eve@example.com',
      studentId: 'STU005',
      courseId: '2',
      courseName: 'Advanced JavaScript',
      status: 'accepted',
      sentAt: '2024-01-18',
      expiresAt: '2024-01-25',
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleInviteStudent = () => {
    // TODO: Implement invite student API call
    console.log('Inviting student:', inviteForm);
    setInviteDialogOpen(false);
    setInviteForm({ email: '', studentId: '', courseId: '', message: '' });
  };

  const handleBulkInvite = () => {
    // TODO: Implement bulk invite API call
    const emails = bulkInviteEmails.split('\n').filter(email => email.trim());
    console.log('Bulk inviting:', emails, 'to course:', inviteForm.courseId);
    setBulkInviteDialogOpen(false);
    setBulkInviteEmails('');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, studentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudentId(studentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudentId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'declined':
        return 'error';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Student Management">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Student Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Invite students, manage enrollments, and track student progress
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setInviteDialogOpen(true)}
          >
            Invite Student
          </Button>
          <Button
            variant="outlined"
            startIcon={<Send />}
            onClick={() => setBulkInviteDialogOpen(true)}
          >
            Bulk Invite
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label={`All Students (${students.length})`} />
            <Tab label={`Invitations (${invitations.length})`} />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          {/* Students List */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Card>
            <List>
              {filteredStudents.map((student, index) => (
                <React.Fragment key={student.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={student.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{student.name}</Typography>
                          <Chip
                            label={student.status}
                            color={getStatusColor(student.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {student.email} • ID: {student.studentId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.enrolledCourses} courses • {student.totalProgress}% avg progress
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Joined: {new Date(student.joinedAt).toLocaleDateString()} • 
                            Last active: {new Date(student.lastActive).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, student.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredStudents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            {filteredStudents.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No students found matching your criteria.
                </Typography>
              </Box>
            )}
          </Card>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {/* Invitations List */}
          <Card>
            <List>
              {invitations.map((invitation, index) => (
                <React.Fragment key={invitation.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Email />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{invitation.email}</Typography>
                          <Chip
                            label={invitation.status}
                            color={getStatusColor(invitation.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Course: {invitation.courseName} • ID: {invitation.studentId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sent: {new Date(invitation.sentAt).toLocaleDateString()} • 
                            Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={invitation.status !== 'pending'}
                      >
                        Resend
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < invitations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            {invitations.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No invitations sent yet.
                </Typography>
              </Box>
            )}
          </Card>
        </TabPanel>

        {/* Student Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <School sx={{ mr: 1 }} />
            View Courses
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Send sx={{ mr: 1 }} />
            Send Message
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Block sx={{ mr: 1 }} />
            Suspend Student
          </MenuItem>
        </Menu>

        {/* Invite Student Dialog */}
        <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Invite Student to Course</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Student Email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <TextField
                fullWidth
                label="Student ID (Optional)"
                value={inviteForm.studentId}
                onChange={(e) => setInviteForm(prev => ({ ...prev, studentId: e.target.value }))}
                helperText="Leave empty to auto-generate"
              />
              <FormControl fullWidth required>
                <InputLabel>Course</InputLabel>
                <Select
                  value={inviteForm.courseId}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, courseId: e.target.value }))}
                  label="Course"
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title} ({course.enrolledStudents} students)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Personal Message (Optional)"
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                helperText="Add a personal message to the invitation"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleInviteStudent}
              variant="contained"
              disabled={!inviteForm.email || !inviteForm.courseId}
            >
              Send Invitation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Invite Dialog */}
        <Dialog open={bulkInviteDialogOpen} onClose={() => setBulkInviteDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Bulk Invite Students</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Course</InputLabel>
                <Select
                  value={inviteForm.courseId}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, courseId: e.target.value }))}
                  label="Course"
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title} ({course.enrolledStudents} students)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Student Emails"
                value={bulkInviteEmails}
                onChange={(e) => setBulkInviteEmails(e.target.value)}
                placeholder="Enter one email per line&#10;student1@example.com&#10;student2@example.com&#10;student3@example.com"
                helperText="Enter one email address per line"
              />
              <Alert severity="info">
                Students will receive individual invitations with auto-generated student IDs.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkInviteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleBulkInvite}
              variant="contained"
              disabled={!inviteForm.courseId || !bulkInviteEmails.trim()}
            >
              Send Invitations
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}