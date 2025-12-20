'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  School,
  PlayCircle,
  Assignment,
  Download,
  Visibility,
  Timeline,
  Assessment,
  Schedule,
  Star,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InstructorAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  // Fetch analytics data from backend
  const { data: overviewStats, isLoading: loadingOverview } = useQuery({
    queryKey: ['instructor', 'analytics', 'overview', selectedPeriod],
    queryFn: async () => {
      const response = await api.get(`/instructor/analytics/overview?days=${selectedPeriod}`);
      return response.data;
    }
  });

  const { data: coursePerformanceData = [], isLoading: loadingPerformance } = useQuery({
    queryKey: ['instructor', 'analytics', 'course-performance'],
    queryFn: async () => {
      const response = await api.get('/instructor/analytics/course-performance');
      return response.data;
    }
  });

  const { data: engagementData = [], isLoading: loadingEngagement } = useQuery({
    queryKey: ['instructor', 'analytics', 'engagement', selectedPeriod],
    queryFn: async () => {
      const response = await api.get(`/instructor/analytics/student-engagement?days=${selectedPeriod}`);
      return response.data;
    }
  });

  const { data: topPerformers = [], isLoading: loadingPerformers } = useQuery({
    queryKey: ['instructor', 'analytics', 'top-performers'],
    queryFn: async () => {
      const response = await api.get('/instructor/analytics/top-performers?limit=5');
      return response.data;
    }
  });

  const { data: recentActivity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ['instructor', 'analytics', 'recent-activity'],
    queryFn: async () => {
      const response = await api.get('/instructor/analytics/recent-activity?limit=10');
      return response.data;
    }
  });

  const { data: studentDistributionData = [], isLoading: loadingDistribution } = useQuery({
    queryKey: ['instructor', 'analytics', 'student-distribution'],
    queryFn: async () => {
      const response = await api.get('/instructor/analytics/student-distribution');
      return response.data;
    }
  });

  const isLoading = loadingOverview || loadingPerformance || loadingEngagement;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const StatCard = ({ title, value, trend, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              {trend > 0 ? (
                <TrendingUp color="success" fontSize="small" />
              ) : (
                <TrendingDown color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={trend > 0 ? 'success.main' : 'error.main'}
                ml={0.5}
              >
                {trend > 0 ? '+' : ''}{trend}% from last month
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics Dashboard">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="Time Period"
            >
              <MenuItem value="7">Last 7 Days</MenuItem>
              <MenuItem value="30">Last 30 Days</MenuItem>
              <MenuItem value="90">Last 3 Months</MenuItem>
              <MenuItem value="365">Last Year</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Course Filter</InputLabel>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              label="Course Filter"
            >
              <MenuItem value="all">All Courses</MenuItem>
              <MenuItem value="js">JavaScript Fundamentals</MenuItem>
              <MenuItem value="react">React Advanced</MenuItem>
              <MenuItem value="node">Node.js Backend</MenuItem>
              <MenuItem value="db">Database Design</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Download />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Overview Stats */}
      {overviewStats && (
        <Box 
          display="flex" 
          flexWrap="wrap" 
          gap={3} 
          mb={4}
          sx={{
            '& > *': {
              flex: '1 1 250px',
              minWidth: '250px'
            }
          }}
        >
          <StatCard
            title="Total Students"
            value={overviewStats.totalStudents || 0}
            trend={overviewStats.trend?.students || 0}
            icon={<People />}
            color="primary.main"
          />
          <StatCard
            title="Active Courses"
            value={overviewStats.totalCourses || 0}
            trend={overviewStats.trend?.courses || 0}
            icon={<School />}
            color="success.main"
          />
          <StatCard
            title="Live Classes"
            value={overviewStats.totalClasses || 0}
            trend={overviewStats.trend?.classes || 0}
            icon={<PlayCircle />}
            color="warning.main"
          />
          <StatCard
            title="Assignments"
            value={overviewStats.totalAssignments || 0}
            trend={overviewStats.trend?.assignments || 0}
            icon={<Assignment />}
            color="info.main"
          />
        </Box>
      )}

      {/* Tabs for detailed analytics */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Engagement" icon={<Timeline />} />
            <Tab label="Course Performance" icon={<Assessment />} />
            <Tab label="Student Analytics" icon={<People />} />
            <Tab label="Activity Feed" icon={<Schedule />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" flexWrap="wrap" gap={3}>
            {/* Engagement Chart */}
            <Box flex="2 1 600px" minWidth="600px">
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Student Engagement Over Time
                  </Typography>
                  <Box sx={{ height: 300, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    {loadingEngagement ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                      </Box>
                    ) : engagementData.length > 0 ? (
                      <>
                        <Typography variant="body2" color="textSecondary" textAlign="center" mb={2}>
                          Daily Engagement Metrics (Last {selectedPeriod} days)
                        </Typography>
                        <Box mt={3}>
                          <Typography variant="caption" display="block" mb={1}>Recent metrics:</Typography>
                          {engagementData.slice(-3).map((day: any) => (
                            <Box key={day.date} mb={1}>
                              <Typography variant="body2">
                                {new Date(day.date).toLocaleDateString()}: 
                                {' '}Views: {day.views}, 
                                {' '}Submissions: {day.submissions}, 
                                {' '}Participation: {day.participation}%
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary" textAlign="center" mt={10}>
                        No engagement data available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Student Distribution */}
            <Box flex="1 1 300px" minWidth="300px">
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Student Distribution
                  </Typography>
                  <Box sx={{ height: 300, p: 2 }}>
                    {loadingDistribution ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                      </Box>
                    ) : studentDistributionData.length > 0 ? (
                      studentDistributionData.map((item: any, index: number) => {
                        const total = studentDistributionData.reduce((sum: number, i: any) => sum + i.value, 0);
                        return (
                          <Box key={index} mb={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2">{item.name}</Typography>
                              <Typography variant="body2" fontWeight="bold">{item.value}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={total > 0 ? (item.value / total) * 100 : 0}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: item.color,
                                },
                              }}
                            />
                          </Box>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="textSecondary" textAlign="center" mt={10}>
                        No student data available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Course Performance Metrics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course Name</TableCell>
                      <TableCell align="center">Students</TableCell>
                      <TableCell align="center">Completion Rate</TableCell>
                      <TableCell align="center">Rating</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingPerformance ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : coursePerformanceData.length > 0 ? (
                      coursePerformanceData.map((course: any) => (
                        <TableRow key={course.id || course.name}>
                          <TableCell>{course.name}</TableCell>
                          <TableCell align="center">{course.students}</TableCell>
                          <TableCell align="center">
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress
                                variant="determinate"
                                value={course.completion}
                                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="body2">
                                {course.completion}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                              <Star color="warning" fontSize="small" />
                              <Typography variant="body2">
                                {course.rating}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="textSecondary">
                            No course performance data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box display="flex" flexWrap="wrap" gap={3}>
            {/* Top Performers */}
            <Box flex="1 1 400px" minWidth="400px">
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Top Performers
                  </Typography>
                  {loadingPerformers ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : topPerformers.length > 0 ? (
                    <Stack spacing={2}>
                      {topPerformers.map((student: any, index: number) => (
                        <Box key={student.name} display="flex" alignItems="center" gap={2}>
                          <Typography variant="h6" color="primary" minWidth={24}>
                            #{index + 1}
                          </Typography>
                          <Avatar src={student.avatar} alt={student.name}>
                            {student.name.charAt(0)}
                          </Avatar>
                          <Box flexGrow={1}>
                            <Typography variant="subtitle2">{student.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {student.course}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${student.score}%`}
                            color="success"
                            size="small"
                          />
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                      No top performers data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Engagement Metrics */}
            <Box flex="1 1 400px" minWidth="400px">
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Course Enrollment Metrics
                  </Typography>
                  <Box sx={{ height: 250, p: 2 }}>
                    {loadingPerformance ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                      </Box>
                    ) : coursePerformanceData.length > 0 ? (
                      coursePerformanceData.map((course: any, index: number) => {
                        const maxStudents = Math.max(...coursePerformanceData.map((c: any) => c.students), 1);
                        return (
                          <Box key={course.id || course.name} mb={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                {course.name.length > 15 ? course.name.substring(0, 12) + '...' : course.name}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">{course.students}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(course.students / maxStudents) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: `hsl(${210 + index * 30}, 70%, 50%)`,
                                },
                              }}
                            />
                          </Box>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="textSecondary" textAlign="center" mt={8}>
                        No enrollment data available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Recent Student Activity
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Course</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingActivity ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : recentActivity.length > 0 ? (
                      recentActivity.map((activity: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {activity.student.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {activity.student}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={activity.action}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{activity.course}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {activity.time}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="textSecondary">
                            No recent activity available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>
    </DashboardLayout>
  );
};

export default InstructorAnalytics;