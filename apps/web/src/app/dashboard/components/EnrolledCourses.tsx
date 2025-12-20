'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatInstructorName } from '@/utils/formatInstructor';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Button,
  Avatar,
  Chip,
  IconButton,
  Divider,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School,
  MoreVert,
  PlayArrow,
  Assessment,
  BookmarkBorder,
  People,
} from '@mui/icons-material';
import { useEnrolledCourses } from '@/hooks/useCourses';
import { Course as APICourse } from '@/lib/api';

// Extended interface for UI display
interface CourseDisplay extends APICourse {
  progress?: number;
  grade?: string;
  status: 'active' | 'completed' | 'upcoming';
  students?: number;
  assignments?: number;
  nextClass?: string;
}

// Function to transform API course to display format (deterministic, no random)
const transformCourse = (course: APICourse, seed: number = 0): CourseDisplay => {
  // Determine status based on semester
  const currentSemester = 'Spring 2025'; // Current semester
  let status: 'active' | 'completed' | 'upcoming' = 'upcoming';
  
  if (course.semester === currentSemester) {
    status = 'active';
  } else if (course.semester === 'Fall 2024' || course.semester === 'Spring 2024') {
    status = 'completed';
  } else {
    status = 'upcoming';
  }
  
  // Use course ID hash as a deterministic seed
  const courseHash = course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    ...course,
    status,
    progress: status === 'active' ? ((courseHash % 60) + 30) : // 30-90%
              status === 'completed' ? 100 : 0,
    grade: status === 'completed' ? ['A', 'A-', 'B+', 'B', 'A+'][courseHash % 5] :
           status === 'active' ? ['A', 'A-', 'B+', 'B'][courseHash % 4] : '-',
    students: (courseHash % 30) + 15, // 15-45 students
    assignments: status === 'upcoming' ? 0 : (courseHash % 10) + 5, // 5-15 assignments
    nextClass: status === 'active' ? 'Today 9:00 AM' : undefined,
  };
};

const getStatusColor = (status: CourseDisplay['status']) => {
  switch (status) {
    case 'active': return { bg: '#dcfce7', color: '#166534' };
    case 'completed': return { bg: '#dbeafe', color: '#1e40af' };
    case 'upcoming': return { bg: '#fef3c7', color: '#92400e' };
    default: return { bg: '#f3f4f6', color: '#374151' };
  }
};

export default function EnrolledCourses() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Fetch enrolled courses using React Query
  const { data: apiCourses, isLoading, error } = useEnrolledCourses();
  
  // Transform API courses to display format
  const courses = apiCourses ? apiCourses.map(transformCourse) : [];
  
  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.status === filter;
  });

  // Loading state
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Alert severity="error">
          Failed to load courses. Please try again later.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School sx={{ color: '#667eea' }} />
          <Typography variant="h6" fontWeight={600}>
            My Courses
          </Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            sx={{
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2e8f0'
              }
            }}
          >
            <MenuItem value="all">All ({courses.length})</MenuItem>
            <MenuItem value="active">Active ({courses.filter(c => c.status === 'active').length})</MenuItem>
            <MenuItem value="completed">Completed ({courses.filter(c => c.status === 'completed').length})</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Remove old filter tabs */}

      {/* Courses Grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 500, overflowY: 'auto' }}>
        {filteredCourses.map((course, index) => {
          const statusStyle = getStatusColor(course.status);
          
          return (
            <Box key={course.id}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    borderColor: '#cbd5e1',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {/* Course Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: course.color,
                        fontSize: '1.2rem',
                        fontWeight: 700
                      }}
                    >
                      {course.code.slice(0, 2)}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatInstructorName(course.instructor)} • {course.code}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={course.status}
                      size="small"
                      sx={{
                        bgcolor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Progress */}
                {course.status !== 'upcoming' && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {(course.progress || 0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: course.color
                        }
                      }}
                    />
                  </Box>
                )}

                {/* Course Stats */}
                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.students || 0} students
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Assessment fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.assignments || 0} assignments
                    </Typography>
                  </Box>
                  
                  {(course.grade && course.grade !== '-') && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Grade:
                      </Typography>
                      <Chip
                        label={course.grade || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor: '#dcfce7',
                          color: '#166534',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Next Class */}
                {course.nextClass && (
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#f8fafc', 
                    borderRadius: 1.5,
                    border: '1px solid #e2e8f0',
                    mb: 2
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Next class: <strong>{course.nextClass}</strong>
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {course.status === 'active' && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrow />}
                        sx={{
                          bgcolor: course.color,
                          fontSize: '0.75rem',
                          '&:hover': { 
                            bgcolor: course.color,
                            filter: 'brightness(0.9)'
                          }
                        }}
                      >
                        Continue Learning
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Assessment />}
                        sx={{
                          borderColor: '#e2e8f0',
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      >
                        View Grades
                      </Button>
                    </>
                  )}
                  
                  {course.status === 'completed' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Assessment />}
                      sx={{
                        borderColor: '#e2e8f0',
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}
                    >
                      View Certificate
                    </Button>
                  )}
                  
                  {course.status === 'upcoming' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<BookmarkBorder />}
                      sx={{
                        borderColor: '#e2e8f0',
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}
                    >
                      Add to Watchlist
                    </Button>
                  )}
                </Box>
              </Box>
              
              {index < filteredCourses.length - 1 && (
                <Divider sx={{ my: 1, opacity: 0.3 }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* View All Button */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}
        >
          View All Courses
        </Button>
      </Box>
    </Paper>
  );
}