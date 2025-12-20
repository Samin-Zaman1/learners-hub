'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Warning,
  Search,
  School,
  EmojiEvents,
  AccessTime,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface TaskSubmission {
  id: string;
  status: string;
  points: number | null;
  maxPoints: number;
  submittedAt: string | null;
  gradedAt: string | null;
  feedback: string | null;
  task: {
    id: string;
    title: string;
    dueDate: string;
    course: {
      id: string;
      title: string;
      code: string;
      color: string;
    };
  };
}

interface CourseGrade {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  color: string;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  graded: number;
  total: number;
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
      id={`grades-tabpanel-${index}`}
      aria-labelledby={`grades-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GradesPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all tasks and statistics
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['student-tasks'],
    queryFn: () => apiClient.get('/student/tasks').then(res => res.data)
  });

  const { data: statsData } = useQuery({
    queryKey: ['student-tasks-statistics'],
    queryFn: () => apiClient.get('/student/tasks/statistics').then(res => res.data)
  });

  // Process data
  const submissions: TaskSubmission[] = useMemo(() => {
    if (!tasksData) return [];
    return tasksData.filter((task: any) => task.status === 'GRADED');
  }, [tasksData]);

  const courseGrades: CourseGrade[] = useMemo(() => {
    if (!tasksData) return [];
    
    const courseMap = new Map<string, CourseGrade>();
    
    tasksData.forEach((task: any) => {
      const courseId = task.task.course.id;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseId,
          courseTitle: task.task.course.title,
          courseCode: task.task.course.code,
          color: task.task.course.color || '#667eea',
          totalPoints: 0,
          earnedPoints: 0,
          percentage: 0,
          graded: 0,
          total: 0,
        });
      }
      
      const courseGrade = courseMap.get(courseId)!;
      courseGrade.total++;
      
      if (task.status === 'GRADED' && task.points !== null) {
        courseGrade.graded++;
        courseGrade.earnedPoints += task.points;
        courseGrade.totalPoints += task.maxPoints;
      }
    });
    
    // Calculate percentages
    courseMap.forEach(course => {
      if (course.totalPoints > 0) {
        course.percentage = (course.earnedPoints / course.totalPoints) * 100;
      }
    });
    
    return Array.from(courseMap.values()).sort((a, b) => 
      a.courseTitle.localeCompare(b.courseTitle)
    );
  }, [tasksData]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;
    
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(s => s.task.course.id === selectedCourse);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.task.course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [submissions, selectedCourse, searchQuery]);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#3b82f6';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (tasksLoading) {
    return (
      <DashboardLayout title="Grades">
        <Box sx={{ p: 3 }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const overallPercentage = typeof statsData?.averageGrade === 'number' ? statsData.averageGrade : 0;
  const totalGraded = statsData?.gradedTasks || 0;
  const totalSubmissions = statsData?.totalTasks || 0;

  return (
    <DashboardLayout title="Grades">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Grades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your academic performance across all courses
          </Typography>
        </Box>

        {/* Overall Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3, mb: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: getGradeColor(overallPercentage), mr: 2 }}>
                  <EmojiEvents />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {overallPercentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Average
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label={`Grade: ${getGradeLetter(overallPercentage)}`}
                sx={{ 
                  bgcolor: getGradeColor(overallPercentage), 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#3b82f6', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {totalGraded}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Graded Assignments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {totalSubmissions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assignments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#f59e0b', mr: 2 }}>
                  <AccessTime />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {statsData?.overdue || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab icon={<School />} label="By Course" iconPosition="start" />
            <Tab icon={<Assignment />} label="All Assignments" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* By Course Tab */}
        <TabPanel value={currentTab} index={0}>
          {courseGrades.length === 0 ? (
            <Alert severity="info">No grades available yet. Complete and submit assignments to see your grades here.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {courseGrades.map((course) => (
                <Card key={course.courseId} sx={{ borderLeft: `4px solid ${course.color}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: course.color, width: 48, height: 48 }}>
                          {course.courseCode.substring(0, 2)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {course.courseTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {course.courseCode} • {course.graded} of {course.total} graded
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: getGradeColor(course.percentage) }}>
                          {typeof course.percentage === 'number' ? course.percentage.toFixed(1) : '0'}%
                        </Typography>
                        <Chip 
                          label={getGradeLetter(course.percentage)}
                          size="small"
                          sx={{ 
                            bgcolor: getGradeColor(course.percentage), 
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={course.percentage} 
                        sx={{ 
                          flexGrow: 1, 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getGradeColor(course.percentage)
                          }
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {course.earnedPoints} / {course.totalPoints} pts
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>

        {/* All Assignments Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Course</InputLabel>
              <Select
                value={selectedCourse}
                label="Filter by Course"
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <MenuItem value="all">All Courses</MenuItem>
                {courseGrades.map((course) => (
                  <MenuItem key={course.courseId} value={course.courseId}>
                    {course.courseTitle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
          </Box>

          {filteredSubmissions.length === 0 ? (
            <Alert severity="info">No graded assignments found.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell align="center">Score</TableCell>
                    <TableCell align="center">Grade</TableCell>
                    <TableCell>Feedback</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubmissions.map((submission) => {
                    const percentage = submission.maxPoints > 0 
                      ? (submission.points! / submission.maxPoints) * 100 
                      : 0;
                    
                    return (
                      <TableRow key={submission.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {submission.task.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={submission.task.course.code}
                            size="small"
                            sx={{ 
                              bgcolor: submission.task.course.color,
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(submission.task.dueDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {submission.submittedAt 
                              ? new Date(submission.submittedAt).toLocaleDateString()
                              : 'Not submitted'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold">
                            {submission.points || 0} / {submission.maxPoints}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${typeof percentage === 'number' ? percentage.toFixed(0) : '0'}%`}
                            size="small"
                            sx={{
                              bgcolor: getGradeColor(percentage),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {submission.feedback ? (
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {submission.feedback}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No feedback
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Box>
    </DashboardLayout>
  );
}
