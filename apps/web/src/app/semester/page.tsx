'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  LinearProgress,
  Paper,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Check as CheckIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components';
import { formatInstructorName } from '@/utils/formatInstructor';

export default function SemesterPage() {
  const [expandedSemester, setExpandedSemester] = useState<string | false>('Semester 01');

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.get('/auth/profile').then(res => res.data)
  });

  // Fetch all semesters
  const { data: semesters, isLoading: semestersLoading } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => api.get('/courses/semesters/list').then(res => res.data)
  });

  // Fetch statistics
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['semester-statistics'],
    queryFn: () => api.get('/courses/semesters/statistics').then(res => res.data)
  });

  // Fetch available courses
  const { data: availableCourses } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => api.get('/courses/semesters/available').then(res => res.data)
  });

  // Fetch upcoming tasks
  const { data: upcomingTasks } = useQuery({
    queryKey: ['upcoming-tasks'],
    queryFn: () => api.get('/courses/semesters/upcoming-tasks').then(res => res.data)
  });

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSemester(isExpanded ? panel : false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'success';
      case 'ACTIVE':
        return 'info';
      case 'DROPPED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours} hrs`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days`;
    }
  };

  const userName = profile?.firstName && profile?.lastName 
    ? `${profile.firstName} ${profile.lastName}` 
    : profile?.email?.split('@')[0] || 'Student';

  const userMajor = (statistics as unknown as { user?: { department?: string } })?.user?.department || 'Computer Science & Engineering';

  if (semestersLoading || statsLoading) {
    return (
      <DashboardLayout title="My Semester">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Semester">
      <Box sx={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 4 }}>
        {/* Main Content */}
        <Box sx={{ minWidth: 0 }}>
          {/* Welcome Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
              Hi
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              {userName} <span style={{ fontSize: '1.75rem' }}>👋</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              You have started BSc. in {userMajor} learning journey on January 2025 session.
            </Typography>
          </Box>

          {/* Semesters Accordion */}
          <Box sx={{ mb: 3 }}>
            {(semesters as any)?.map((semester: any, index: number) => {
              const semesterName = `Semester ${String(index + 1).padStart(2, '0')}`;
              
              return (
                <Accordion
                  key={semester.semester}
                  expanded={expandedSemester === semesterName}
                  onChange={handleAccordionChange(semesterName)}
                  sx={{ 
                    mb: 1.5, 
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:before': { display: 'none' },
                    borderRadius: '7px',
                    overflow: 'hidden'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      backgroundColor: 'background.paper',
                      minHeight: 72,
                      '&.Mui-expanded': {
                        minHeight: 72,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.125rem' }}>
                          {semesterName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Fall Spring {semester.semester || '2025'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Completed Credit
                        </Typography>
                        <Box sx={{
                          px: 2,
                          py: 0.75,
                          borderRadius: '7px',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 0.5,
                          bgcolor: 'transparent', // Remove background
                          border: '1px solid #e0e7ef',
                        }}>
                          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#14b8a6' }}>
                            {semester.completedCredits}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#fb923c' }}>
                            /{semester.totalCredits}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3 }}>
                    {/* Enrolled Courses Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                      <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1rem' }}>
                        Enrolled Courses
                      </Typography>
                      <Typography variant="body2" color="success.main" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
                        Completed {semester.enrollments.filter((e: any) => e.status === 'COMPLETED').length}/{semester.enrollments.length}
                      </Typography>
                    </Box>

                    {/* Course Cards Grid - 2 per row */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2.5 }}>
                      {semester.enrollments.map((enrollment: any) => (
                        <Card 
                          key={enrollment.enrollmentId}
                          sx={{ 
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: 'none',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '7px',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3, position: 'relative' }}>
                            {/* Three dots menu - Top Right */}
                            <Box sx={{ 
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: '#f3f4f6', borderRadius: '4px' }
                            }}>
                              <Typography sx={{ fontSize: '1.25rem', color: '#9ca3af', lineHeight: 1 }}>⋮</Typography>
                            </Box>

                            {/* Course Title */}
                            <Typography variant="h5" fontWeight="600" sx={{ fontSize: '1.5rem', lineHeight: 1.3, mb: 1.5, pr: 5 }}>
                              {enrollment.course.title}
                            </Typography>
                            
                            {/* Instructor */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                                with
                              </Typography>
                              <Avatar 
                                sx={{ width: 24, height: 24, fontSize: '0.7rem' }}
                                src={enrollment.course.instructor?.avatar}
                              >
                                {formatInstructorName(enrollment.course.instructor).charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                                {formatInstructorName(enrollment.course.instructor)}
                              </Typography>
                            </Box>

                            {/* Progress Bar */}
                            <Box sx={{ mb: 2.5 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={enrollment.status === 'COMPLETED' ? 100 : enrollment.status === 'ACTIVE' ? 57 : 0}
                                sx={{ 
                                  height: 8,
                                  borderRadius: '4px',
                                  bgcolor: '#e5e7eb',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: '4px',
                                    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
                                  }
                                }}
                              />
                            </Box>

                            {/* Bottom Row: Badges and Status */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {/* Left: Info Badges */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {/* Course Code Badge */}
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.75,
                                  px: 1.5,
                                  py: 0.75,
                                  borderRadius: '7px'
                                }}>
                                  <Typography sx={{ fontSize: '1rem' }}>📄</Typography>
                                  <Typography sx={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: 600 }}>
                                    {enrollment.course.code}
                                  </Typography>
                                </Box>

                                {/* Credits Badge */}
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.75,
                                  px: 1.5,
                                  py: 0.75,
                                  borderRadius: '7px'
                                }}>
                                  <Typography sx={{ fontSize: '1rem' }}>🕐</Typography>
                                  <Typography sx={{ fontSize: '0.875rem', color: '#c2410c', fontWeight: 600 }}>
                                    {enrollment.course.credits} Credits
                                  </Typography>
                                </Box>

                                {/* Students/Info Badge */}
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.75,
                                  px: 1.5,
                                  py: 0.75,
                                  borderRadius: '7px'
                                }}>
                                  <Typography sx={{ fontSize: '1rem' }}>👥</Typography>
                                  <Typography sx={{ fontSize: '0.875rem', color: '#065f46', fontWeight: 600 }}>
                                    {enrollment.course._count?.Enrollment || enrollment.course.enrollmentCount || '-'}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Right: Status Badge */}
                              <Box sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 2,
                                py: 1,
                                borderRadius: '7px',
                              }}>
                                <Typography sx={{ fontSize: '1rem', color: enrollment.status === 'COMPLETED' ? '#047857' : enrollment.status === 'ACTIVE' ? '#d97706' : '#dc2626' }}>
                                  {enrollment.status === 'COMPLETED' ? '👑' : enrollment.status === 'ACTIVE' ? '🔄' : '❌'}
                                </Typography>
                                <Typography 
                                  sx={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    color: enrollment.status === 'COMPLETED' ? '#047857' : enrollment.status === 'ACTIVE' ? '#d97706' : '#dc2626'
                                  }}
                                >
                                  {enrollment.status === 'COMPLETED' ? 'Completed!' : enrollment.status === 'ACTIVE' ? 'Ongoing' : 'Dropped'}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>

          {/* Available Courses */}
          {availableCourses && (availableCourses as unknown as Array<any>).length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1rem' }}>
                  Available Courses
                </Typography>
                <Typography variant="body2" color="primary.main" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
                  {(availableCourses as unknown as Array<any>).length.toString().padStart(2, '0')} Courses
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2.5 }}>
                {(availableCourses as unknown as Array<any>).slice(0, 4).map((course: any) => (
                  <Box key={course.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: 'none',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '7px',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography variant="subtitle1" fontWeight="700" sx={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                            {course.title}
                          </Typography>
                          <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            bgcolor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Typography sx={{ fontSize: '0.75rem' }}>ℹ️</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Avatar 
                            sx={{ width: 20, height: 20, fontSize: '0.625rem' }}
                            src={course.instructor?.avatar}
                          >
                            {course.instructor ? formatInstructorName(course.instructor).charAt(0) : '?'}
                          </Avatar>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            with <span style={{ fontWeight: 500 }}>👤 {course.instructor ? formatInstructorName(course.instructor) : 'TBA'}</span>
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            px: 1.25,
                            py: 0.5,
                            bgcolor: '#f0f9ff',
                            borderRadius: '7px',
                            border: '1px solid #e0f2fe'
                          }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                              📘 {course.code}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            px: 1.25,
                            py: 0.5,
                            bgcolor: '#fefce8',
                            borderRadius: '7px',
                            border: '1px solid #fef9c3'
                          }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#ca8a04', fontWeight: 600 }}>
                              ⭐ {course.credits} Credits
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            px: 1.25,
                            py: 0.5,
                            bgcolor: '#f0fdf4',
                            borderRadius: '7px',
                            border: '1px solid #dcfce7'
                          }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                              📊 {course._count?.Enrollment || course.enrollmentCount || '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks && (upcomingTasks as unknown as Array<any>).length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Upcoming Tasks
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    pending task
                  </Typography>
                  <Typography variant="caption" color="error.main" fontWeight="bold">
                    {(upcomingTasks as unknown as Array<any>)[0] ? formatTimeRemaining((upcomingTasks as unknown as Array<any>)[0].dueDate) : ''}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                {(upcomingTasks as unknown as Array<any>).slice(0, 3).map((task: any) => (
                  <Box key={task.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                          {task.type === 'quiz' || task.type === 'QUIZ' ? (
                            <QuizIcon color="primary" />
                          ) : (
                            <AssignmentIcon color="primary" />
                          )}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.courseCode}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Stack spacing={3}>
            {/* Semester Updates Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.125rem' }}>
                Semester Updates
              </Typography>
            </Box>

            {/* Semester Performance Card */}
            <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: '7px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ fontSize: '0.9rem' }}>
                  Semester Performance
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', lineHeight: 1.3, fontSize: '0.7rem' }}>
                  Till 10th July<br />2025
                </Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.95rem' }}>
                Course Completion Rate
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <svg width="280" height="180" viewBox="0 0 280 180">
                    {/* Background arc */}
                    <path
                      d="M 40,140 A 100,100 0 0,1 240,140"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="28"
                      strokeLinecap="round"
                    />
                    {/* Red to Green progress arc */}
                    <defs>
                      <linearGradient id="dial-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#ef4444" />
                        <stop offset="100%" stop-color="#22c55e" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 40,140 A 100,100 0 0,1 173,45"
                      fill="none"
                      stroke="url(#dial-gradient)"
                      strokeWidth="28"
                      strokeLinecap="round"
                    />
                  </svg>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      pt: 2
                    }}
                  >
                    <Typography variant="h2" fontWeight="bold" sx={{ fontSize: '2rem', lineHeight: 1, color: '#0f766e' }}>
                      {(statistics as unknown as { completionRate?: number })?.completionRate || 57}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.7rem', fontWeight: 600 }}>
                      Running Same Pace
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Stats Card */}
            <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: '7px' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ fontSize: '0.9rem', mb: 0.5 }}>
                  Semester Updates
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  You have Choosen <span style={{ fontWeight: 600, color: '#3b82f6' }}>12 Credits</span> for this semester
                </Typography>
              </Box>

            {/* Stats Grid */}
            <Stack spacing={2.5} sx={{ mt: 3 }}>
              {/* Indicator: Total Enrolled Courses */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, border: '2px solid #3b82f6', borderRadius: '12px', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SchoolIcon sx={{ color: '#2563eb', fontSize: 28 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Total Enrolled Courses
                  </Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.5rem', color: '#2563eb' }}>
                    {(statistics as unknown as { totalEnrolledCourses?: string })?.totalEnrolledCourses || '4'}
                  </Typography>
                </Box>
              </Box>

              {/* Indicator: Course Completed */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, border: '2px solid #22c55e', borderRadius: '12px', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckIcon sx={{ color: '#22c55e', fontSize: 28 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Course Completed
                  </Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.5rem', color: '#22c55e' }}>
                    {(statistics as unknown as { completedCourses?: number })?.completedCourses?.toString().padStart(2, '0') || '01'}
                  </Typography>
                </Box>
              </Box>

              {/* Indicator: Assignments Submitted */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, border: '2px solid #a855f7', borderRadius: '12px', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AssignmentIcon sx={{ color: '#a855f7', fontSize: 28 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Assignments Submitted
                  </Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.1rem', color: '#a855f7' }}>
                    {(statistics as unknown as { assignments?: { submitted?: number, total?: number } })?.assignments?.submitted || 2}/{(statistics as unknown as { assignments?: { submitted?: number, total?: number } })?.assignments?.total || 30}
                  </Typography>
                </Box>
              </Box>

              {/* Indicator: Quiz Attended */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, border: '2px solid #f97316', borderRadius: '12px', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QuizIcon sx={{ color: '#f97316', fontSize: 28 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Quiz Attended
                  </Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.1rem', color: '#f97316' }}>
                    {(statistics as unknown as { quizzes?: { attended?: number, total?: number } })?.quizzes?.attended || 2}/{(statistics as unknown as { quizzes?: { attended?: number, total?: number } })?.quizzes?.total || 18}
                  </Typography>
                </Box>
              </Box>
            </Stack>

              {/* Faculties */}
              <Divider sx={{ my: 3 }} />
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ fontSize: '0.9rem' }}>
                    Faculties for this semester
                  </Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {(statistics as unknown as { faculties?: Array<unknown> })?.faculties?.length || '05'} Faculties
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5, fontSize: '0.75rem' }}>
                  You will learn from <span style={{ fontWeight: 600, color: '#3b82f6' }}>05</span> different faculties in this semester
                </Typography>

                <Stack spacing={2.5}>
                  {((statistics as any)?.faculties || [{ 
                    id: 1, 
                    name: 'David Miller',
                    department: 'Computer Science & Engineering',
                    university: 'Northeastern University',
                    role: 'Department Head'
                  }]).map((faculty: any) => (
                    <Box key={faculty.id} sx={{ display: 'flex', gap: 1.5 }}>
                      <Avatar 
                        sx={{ 
                          width: 44, 
                          height: 44,
                          bgcolor: '#3b82f6',
                          fontSize: '1rem',
                          fontWeight: 600
                        }}
                      >
                        {faculty.name?.split(' ').map((n: string) => n[0]).join('') || 'DM'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="700" sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                          {faculty.name || 'David Miller'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem', mb: 0.25 }}>
                          {faculty.role || 'Department Head'}, {faculty.department || 'Computer Science & Engineering'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {faculty.university || 'Northeastern University'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </DashboardLayout>
  );
}