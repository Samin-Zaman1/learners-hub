'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Event,
  AccessTime,
  LocationOn,
  Person,
} from '@mui/icons-material';

interface ClassItem {
  id: string;
  title: string;
  instructor: string;
  time: string;
  duration: string;
  location: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'exam';
  status: 'upcoming' | 'ongoing' | 'completed';
}

const mockClasses: ClassItem[] = [
  {
    id: 'class-1',
    title: 'Advanced Mathematics',
    instructor: 'Dr. Sarah Wilson',
    time: '09:00 AM',
    duration: '1h 30m',
    location: 'Room 101',
    type: 'lecture',
    status: 'upcoming'
  },
  {
    id: 'class-2',
    title: 'Physics Laboratory',
    instructor: 'Prof. Michael Chen',
    time: '11:00 AM',
    duration: '2h',
    location: 'Lab B-205',
    type: 'lab',
    status: 'upcoming'
  },
  {
    id: 'class-3',
    title: 'Computer Science',
    instructor: 'Dr. Emily Rodriguez',
    time: '02:00 PM',
    duration: '1h 15m',
    location: 'Room 303',
    type: 'lecture',
    status: 'upcoming'
  },
  {
    id: '4',
    title: 'English Literature',
    instructor: 'Ms. Jane Thompson',
    time: '04:00 PM',
    duration: '1h',
    location: 'Room 205',
    type: 'tutorial',
    status: 'upcoming'
  }
];

const getTypeColor = (type: ClassItem['type']) => {
  switch (type) {
    case 'lecture': return { bg: '#e3f2fd', color: '#1976d2' };
    case 'lab': return { bg: '#f3e5f5', color: '#7b1fa2' };
    case 'tutorial': return { bg: '#e8f5e8', color: '#388e3c' };
    case 'exam': return { bg: '#fff3e0', color: '#f57c00' };
    default: return { bg: '#f5f5f5', color: '#666' };
  }
};

export default function ClassSchedule() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
  }, []);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (!currentDate) return;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  if (!mounted || !currentDate) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Event sx={{ color: '#667eea' }} />
          <Typography variant="h6" fontWeight={600}>
            Class Schedule
          </Typography>
        </Box>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Event sx={{ color: '#667eea' }} />
          <Typography variant="h6" fontWeight={600}>
            Class Schedule
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => navigateDate('prev')}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 140, textAlign: 'center' }}>
            {formatDate(currentDate)}
          </Typography>
          <IconButton size="small" onClick={() => navigateDate('next')}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Class List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockClasses.map((classItem, index) => {
          const typeStyle = getTypeColor(classItem.type);
          
          return (
            <Box key={classItem.id}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  bgcolor: classItem.status === 'ongoing' ? '#f0fff4' : 'white',
                  borderLeft: classItem.status === 'ongoing' ? '4px solid #10b981' : '4px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    borderColor: '#cbd5e1'
                  }
                }}
              >
                {/* Time */}
                <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {classItem.time}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {classItem.duration}
                  </Typography>
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Content */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {classItem.title}
                    </Typography>
                    <Chip
                      label={classItem.type.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: typeStyle.bg,
                        color: typeStyle.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {classItem.instructor}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {classItem.location}
                      </Typography>
                    </Box>
                  </Box>

                  {classItem.status === 'upcoming' && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#e2e8f0',
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          bgcolor: '#667eea',
                          fontSize: '0.75rem',
                          '&:hover': { bgcolor: '#5a67d8' }
                        }}
                      >
                        Join Class
                      </Button>
                    </Box>
                  )}

                  {classItem.status === 'ongoing' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: '#10b981',
                        animation: 'pulse 2s infinite' 
                      }} />
                      <Typography variant="body2" color="#10b981" fontWeight={600}>
                        Class in progress
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              {index < mockClasses.length - 1 && (
                <Divider sx={{ my: 1, opacity: 0.3 }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}
          >
            View Full Schedule
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5a67d8' } }}
          >
            Add to Calendar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}