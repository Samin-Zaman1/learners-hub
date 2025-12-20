'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Badge,
  Divider,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Notifications,
  Settings,
  Dashboard as DashboardIcon,
  School,
  Assignment,
  Event,
  Announcement,
  Search,
  LightMode,
  DarkMode,
  Chat,
} from '@mui/icons-material';

// Import dashboard components
import RecentActivities from './components/RecentActivities';
import EnrolledCourses from './components/EnrolledCourses';
import Announcements from './components/Announcements';
import UpcomingTasks from './components/UpcomingTasks';

// Import shared components
import { 
  ActivityChart, 
  useActivityDataForPage,
  useScheduleDataForPage,
  DashboardLayout
} from '../../components';
import WeekCalendar from '../../components/shared/WeekCalendar';
import RoleGuard from '../../components/shared/RoleGuard';

// Import hooks for real data
import { useAuth } from '../../hooks/useAuth';
import { useEnrolledCourses } from '../../hooks/useCourses';
import { useUpcomingTasks } from '../../hooks/useTasks';
import { useTodaySchedule } from '../../hooks/useSchedule';
import { useUnreadAnnouncementsCount } from '../../hooks/useAnnouncements';

export default function StudentDashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  
  // Data hooks for shared components
  const { data: activityData, loading: activityLoading, config: activityConfig } = useActivityDataForPage('dashboard');
  const { events: apiScheduleEvents, loading: scheduleLoading, config: scheduleConfig } = useScheduleDataForPage('dashboard');
  
  // Add dummy schedule events - December 2025
  const dummyEvents = [
    // Week 1 (Dec 16-22)
    { id: 1, title: 'Data Structures', date: '2025-12-16', time: '08:00', type: 'class' as const, color: '#A78BFA', description: 'Room 301' },
    { id: 2, title: 'Algorithms Lab', date: '2025-12-16', time: '10:30', type: 'class' as const, color: '#60A5FA', description: 'Lab 405' },
    { id: 3, title: 'Database Systems', date: '2025-12-16', time: '14:00', type: 'class' as const, color: '#34D399', description: 'Room 202' },
    
    { id: 4, title: 'Operating Systems', date: '2025-12-17', time: '09:00', type: 'class' as const, color: '#FB923C', description: 'Room 105' },
    { id: 5, title: 'Web Development', date: '2025-12-17', time: '11:30', type: 'class' as const, color: '#F59E0B', description: 'Lab 302' },
    { id: 6, title: 'Software Engineering', date: '2025-12-17', time: '15:00', type: 'class' as const, color: '#EC4899', description: 'Room 401' },
    
    { id: 7, title: 'Data Structures', date: '2025-12-18', time: '08:00', type: 'class' as const, color: '#A78BFA', description: 'Room 301' },
    { id: 8, title: 'Computer Networks', date: '2025-12-18', time: '10:00', type: 'class' as const, color: '#8B5CF6', description: 'Room 204' },
    { id: 9, title: 'Database Systems', date: '2025-12-18', time: '14:00', type: 'class' as const, color: '#34D399', description: 'Room 202' },
    
    { id: 10, title: 'Operating Systems', date: '2025-12-19', time: '09:00', type: 'class' as const, color: '#FB923C', description: 'Room 105' },
    { id: 11, title: 'Algorithms Quiz', date: '2025-12-19', time: '11:00', type: 'exam' as const, color: '#EF4444', description: 'Hall A' },
    { id: 12, title: 'Web Development', date: '2025-12-19', time: '13:30', type: 'class' as const, color: '#F59E0B', description: 'Lab 302' },
    
    { id: 13, title: 'Data Structures', date: '2025-12-20', time: '08:00', type: 'class' as const, color: '#A78BFA', description: 'Room 301' },
    { id: 14, title: 'Project Meeting', date: '2025-12-20', time: '10:30', type: 'meeting' as const, color: '#10B981', description: 'Room 501' },
    { id: 15, title: 'Computer Networks', date: '2025-12-20', time: '15:00', type: 'class' as const, color: '#8B5CF6', description: 'Room 204' },
    
    // Week 2 (Dec 23-29)
    { id: 16, title: 'Operating Systems', date: '2025-12-23', time: '09:00', type: 'class' as const, color: '#FB923C', description: 'Room 105' },
    { id: 17, title: 'Database Assignment Due', date: '2025-12-23', time: '23:59', type: 'assignment' as const, color: '#F59E0B', description: 'Online' },
    
    { id: 18, title: 'Software Engineering', date: '2025-12-24', time: '10:00', type: 'class' as const, color: '#EC4899', description: 'Room 401' },
    { id: 19, title: 'Web Development', date: '2025-12-24', time: '14:00', type: 'class' as const, color: '#F59E0B', description: 'Lab 302' },
    
    { id: 20, title: 'Final Project Review', date: '2025-12-27', time: '10:00', type: 'meeting' as const, color: '#10B981', description: 'Room 501' },
    { id: 21, title: 'Computer Networks', date: '2025-12-27', time: '13:00', type: 'class' as const, color: '#8B5CF6', description: 'Room 204' }
  ];
  
  const scheduleEvents = apiScheduleEvents.length > 0 ? apiScheduleEvents : dummyEvents;
  console.log('Dashboard scheduleEvents:', scheduleEvents.length, 'events');

  // Real API data hooks
  const { user } = useAuth();
  const { data: enrolledCourses } = useEnrolledCourses();
  const { data: upcomingTasks } = useUpcomingTasks();
  const { data: todaySchedule } = useTodaySchedule();
  const { data: unreadCount } = useUnreadAnnouncementsCount();

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  // Get real user data
  const studentName = user?.email?.split('@')[0] || 'Student';
  const studentId = user?.id?.slice(0, 10).toUpperCase() || 'STUDENT';
  
  // Calculate real stats
  const totalCourses = enrolledCourses?.length || 0;
  const totalClasses = todaySchedule?.length || 0; // Could be updated to all classes count
  const totalAssignments = upcomingTasks?.filter(t => t.type === 'ASSIGNMENT').length || 0;
  const totalQuizzes = upcomingTasks?.filter(t => t.type === 'QUIZ').length || 0;
  const semesterProgress = 65; // TODO: Calculate actual semester progress percentage

  return (
    <RoleGuard allowedRoles={['STUDENT', 'INSTRUCTOR']}>
      <DashboardLayout title="Student Dashboard">
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
        {/* Top Header Bar - Aligned with sidebar */}
        <Paper 
          elevation={0}
          sx={{ 
            position: 'sticky',
            top: 0,
            zIndex: 100,
            bgcolor: 'white',
            borderBottom: '1px solid #e5e7eb',
            mb: 3,
            mx: -3,
            mt: -3,
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: 72,
            pl: 2.5,
            pr: 2.5,
            gap: 4,
          }}>
            {/* Logo - Hidden on desktop, shown on mobile when sidebar is hidden */}
            <Box 
              component="img"
              src="/logo.svg"
              alt="Champius"
              sx={{
                height: 40,
                width: 'auto',
                display: { xs: 'block', md: 'none' }
              }}
            />

            {/* Search Bar */}
            <TextField
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ 
                width: { xs: '200px', md: '350px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: 'none',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#f1f5f9',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Right Side - Icons and Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
              {/* Chat/Message */}
              <IconButton 
                onClick={() => setChatDrawerOpen(true)}
                sx={{ p: 1 }}
                aria-label="Messages"
              >
                <Box
                  component="img"
                  src="/Message.svg"
                  alt="Messages"
                  sx={{ width: 50, height: 50 }}
                />
              </IconButton>
              
              {/* Notifications */}
              <IconButton 
                onClick={() => setNotificationDrawerOpen(true)}
                sx={{ p: 1 }}
                aria-label="Notifications"
              >
                <Box
                  component="img"
                  src="/Notifications.svg"
                  alt="Notifications"
                  sx={{ width: 50, height: 50 }}
                />
              </IconButton>
              
              {/* Theme Mode */}
              <IconButton 
                onClick={() => setIsDarkMode(!isDarkMode)}
                sx={{ p: 1 }}
                aria-label="Toggle theme"
              >
                <Box
                  component="img"
                  src="/Mode.svg"
                  alt="Mode"
                  sx={{ width: 50, height: 50 }}
                />
              </IconButton>
              
              {/* Divider */}
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              
              {/* User Profile Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {studentName.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
                    {studentName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                    Student Id: {studentId}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Welcome Message */}
        <Box sx={{ px: 3, mb: 3 }}>
          <Typography variant="h4" fontWeight={600} color="text.primary">
            Welcome, {studentName.split(' ')[0]} 🤩
          </Typography>
        </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Quick Stats */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 2.5,
          mb: 3 
        }}>
          <Paper sx={{ py: 3, px: 2.5, borderRadius: 3, bgcolor: '#f0f9ff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Box
                  component="img"
                  src="/Semester progress.svg"
                  alt="Semester Progress"
                  sx={{ width: 32, height: 32 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="#60a5fa" fontWeight={600} sx={{ mb: 0.5 }}>
                  Semester Progress
                </Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {semesterProgress}%
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Paper sx={{ py: 3, px: 2.5, borderRadius: 3, bgcolor: '#f0fdf4' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Box
                  component="img"
                  src="/Total Courses.svg"
                  alt="Total Courses"
                  sx={{ width: 32, height: 32 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="#34d399" fontWeight={600} sx={{ mb: 0.5 }}>
                  Total Courses
                </Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {totalCourses}
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Paper sx={{ py: 3, px: 2.5, borderRadius: 3, bgcolor: '#f5f3ff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#ddd6fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Box
                  component="img"
                  src="/Total Classes.svg"
                  alt="Total Classes"
                  sx={{ width: 32, height: 32 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="#a78bfa" fontWeight={600} sx={{ mb: 0.5 }}>
                  Total Classes
                </Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {totalClasses}
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Paper sx={{ py: 3, px: 2.5, borderRadius: 3, bgcolor: '#fff7ed' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Box
                  component="img"
                  src="/Total Assignments.svg"
                  alt="Total Assignments"
                  sx={{ width: 32, height: 32 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="#fb923c" fontWeight={600} sx={{ mb: 0.5 }}>
                  Total Assignments
                </Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {totalAssignments}
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Paper sx={{ py: 3, px: 2.5, borderRadius: 3, bgcolor: '#fdf4ff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#f0abfc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Box
                  component="img"
                  src="/Total Quizzes.svg"
                  alt="Total Quizzes"
                  sx={{ width: 32, height: 32 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="#e879f9" fontWeight={600} sx={{ mb: 0.5 }}>
                  Total Quizzes
                </Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {totalQuizzes}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Main Dashboard Grid - Two Column Layout */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '6fr 4fr' },
          gap: 5,
          mb: 3,
          alignItems: 'start'
        }}>
          {/* Left Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* My Schedule */}
            <WeekCalendar
              title="My Schedule"
              events={scheduleEvents}
              onEventClick={(event) => console.log('Event clicked:', event)}
            />
            
            {/* Enrolled Courses */}
            <EnrolledCourses />
          </Box>
          
          {/* Right Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* My Activity */}
            <ActivityChart
              title="My Activity"
              data={activityData}
              {...activityConfig}
              defaultSemester="this-week"
              height={420}
              onDataChange={(semester, activities) => console.log('Activity filter changed:', { semester, activities })}
            />
            
            {/* Announcements */}
            <Announcements />
          </Box>
        </Box>

        {/* Bottom Section - Upcoming Tasks */}
        <Box sx={{ mb: 3 }}>
          <UpcomingTasks />
        </Box>

        {/* Recent Activities - Bottom Section */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
          mb: 3
        }}>
          {/* Left - Upcoming Tasks */}
          <UpcomingTasks />
          
          {/* Right - Recent Activities */}
          <RecentActivities />
        </Box>
      </Box>
      
      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 380 },
            p: 3,
          },
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Notifications
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {[
            { title: 'New Assignment Posted', subtitle: 'Web Development - Due in 3 days', time: '2 hours ago' },
            { title: 'Grade Updated', subtitle: 'Database Systems - Quiz 2: 95%', time: '5 hours ago' },
            { title: 'Class Rescheduled', subtitle: 'Mobile App Development - Tomorrow 2pm', time: '1 day ago' },
          ].map((notification, index) => (
            <ListItem key={index} sx={{ py: 2, borderBottom: '1px solid #f0f0f0' }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#667eea' }}>
                  <Notifications />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {notification.subtitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            p: 3,
          },
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Messages
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {[
            { name: 'Dr. John Smith', message: 'Your project submission looks great!', time: '10 min ago', unread: true },
            { name: 'Study Group', message: 'Meeting tomorrow at 3 PM?', time: '1 hour ago', unread: true },
            { name: 'Sarah Johnson', message: 'Can you share the notes from yesterday?', time: '2 hours ago', unread: false },
          ].map((chat, index) => (
            <ListItem 
              key={index} 
              sx={{ 
                py: 2, 
                borderBottom: '1px solid #f0f0f0',
                bgcolor: chat.unread ? '#f8fafc' : 'transparent',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f0f4ff' }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#764ba2' }}>
                  {chat.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={chat.unread ? 600 : 400}>
                      {chat.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {chat.time}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    fontWeight={chat.unread ? 500 : 400}
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    {chat.message}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
      </Box>
    </DashboardLayout>
    </RoleGuard>
  );
}