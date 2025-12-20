'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  ViewWeek,
  ViewModule,
} from '@mui/icons-material';

interface ClassEvent {
  id: string;
  title: string;
  instructor: string;
  time: string;
  endTime: string;
  location: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'exam';
  date: Date;
  color: string;
}

const mockClasses: ClassEvent[] = [
  {
    id: 'schedule-1',
    title: 'Advanced Math',
    instructor: 'Dr. Wilson',
    time: '09:00',
    endTime: '10:30',
    location: 'Room 101',
    type: 'lecture',
    date: new Date(2025, 9, 7), // Today
    color: '#667eea'
  },
  {
    id: 'schedule-2',
    title: 'Physics Lab',
    instructor: 'Prof. Chen',
    time: '11:00',
    endTime: '13:00',
    location: 'Lab B-205',
    type: 'lab',
    date: new Date(2025, 9, 7), // Today
    color: '#8b5cf6'
  },
  {
    id: 'schedule-3',
    title: 'Computer Science',
    instructor: 'Dr. Rodriguez',
    time: '14:00',
    endTime: '15:15',
    location: 'Room 303',
    type: 'lecture',
    date: new Date(2025, 9, 7), // Today
    color: '#10b981'
  },
  {
    id: '4',
    title: 'English Literature',
    instructor: 'Ms. Thompson',
    time: '10:00',
    endTime: '11:00',
    location: 'Room 205',
    type: 'tutorial',
    date: new Date(2025, 9, 8), // Tomorrow
    color: '#f59e0b'
  },
  {
    id: '5',
    title: 'Chemistry',
    instructor: 'Prof. Park',
    time: '09:00',
    endTime: '10:30',
    location: 'Lab C-102',
    type: 'lab',
    date: new Date(2025, 9, 9),
    color: '#ef4444'
  },
  {
    id: '6',
    title: 'Math Tutorial',
    instructor: 'Dr. Wilson',
    time: '15:00',
    endTime: '16:00',
    location: 'Room 150',
    type: 'tutorial',
    date: new Date(2025, 9, 10),
    color: '#667eea'
  }
];

type ViewType = 'week' | 'month';

export default function MySchedule() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 7)); // October 7, 2025
  const [viewType, setViewType] = useState<ViewType>('week');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const days = [];
    const totalDays = 42; // 6 weeks * 7 days

    for (let i = 0; i < totalDays; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getClassesForDate = (date: Date) => {
    return mockClasses.filter(classEvent => 
      classEvent.date.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    
    return (
      <Box>
        {/* Week Header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 2 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Box key={day} sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {day}
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight={600}
                sx={{
                  color: isToday(weekDays[index]) ? '#667eea' : 'text.primary',
                  bgcolor: isToday(weekDays[index]) ? '#e8eafc' : 'transparent',
                  borderRadius: 1,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mt: 0.5
                }}
              >
                {weekDays[index].getDate()}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Week Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {weekDays.map((day, index) => {
            const dayClasses = getClassesForDate(day);
            
            return (
              <Box
                key={index}
                sx={{
                  minHeight: 150,
                  p: 1,
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  bgcolor: isToday(day) ? '#f8fafc' : 'white'
                }}
              >
                {dayClasses.map((classEvent) => (
                  <Box
                    key={classEvent.id}
                    sx={{
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: classEvent.color,
                      color: 'white',
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      cursor: 'pointer',
                      '&:hover': {
                        filter: 'brightness(0.9)'
                      }
                    }}
                  >
                    <Typography variant="caption" fontWeight={600} display="block">
                      {classEvent.title}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {classEvent.time}-{classEvent.endTime}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {classEvent.location}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays(currentDate);
    
    return (
      <Box>
        {/* Month Header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 2 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Box key={day} sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Month Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {monthDays.map((day, index) => {
            const dayClasses = getClassesForDate(day);
            
            return (
              <Box
                key={index}
                sx={{
                  minHeight: 80,
                  p: 1,
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  bgcolor: isToday(day) ? '#f8fafc' : 'white',
                  opacity: isCurrentMonth(day) ? 1 : 0.5
                }}
              >
                <Typography 
                  variant="body2" 
                  fontWeight={isToday(day) ? 600 : 400}
                  sx={{ color: isToday(day) ? '#667eea' : 'text.primary', mb: 0.5 }}
                >
                  {day.getDate()}
                </Typography>
                
                {dayClasses.slice(0, 2).map((classEvent) => (
                  <Box
                    key={classEvent.id}
                    sx={{
                      width: '100%',
                      height: 4,
                      borderRadius: 2,
                      bgcolor: classEvent.color,
                      mb: 0.5,
                      cursor: 'pointer',
                      '&:hover': {
                        height: 6
                      },
                      transition: 'height 0.2s'
                    }}
                    title={`${classEvent.title} - ${classEvent.time}`}
                  />
                ))}
                
                {dayClasses.length > 2 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dayClasses.length - 2} more
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ color: '#667eea' }} />
          <Typography variant="h6" fontWeight={600}>
            My Schedule
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant={viewType === 'week' ? 'contained' : 'outlined'}
            onClick={() => setViewType('week')}
            startIcon={<ViewWeek />}
            sx={{
              bgcolor: viewType === 'week' ? '#667eea' : 'transparent',
              borderColor: '#e2e8f0',
              color: viewType === 'week' ? 'white' : 'text.secondary',
              fontSize: '0.75rem',
              '&:hover': {
                bgcolor: viewType === 'week' ? '#5a67d8' : '#f8fafc'
              }
            }}
          >
            Week
          </Button>
          <Button
            size="small"
            variant={viewType === 'month' ? 'contained' : 'outlined'}
            onClick={() => setViewType('month')}
            startIcon={<ViewModule />}
            sx={{
              bgcolor: viewType === 'month' ? '#667eea' : 'transparent',
              borderColor: '#e2e8f0',
              color: viewType === 'month' ? 'white' : 'text.secondary',
              fontSize: '0.75rem',
              '&:hover': {
                bgcolor: viewType === 'month' ? '#5a67d8' : '#f8fafc'
              }
            }}
          >
            Month
          </Button>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton size="small" onClick={() => navigateDate('prev')}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          {formatDate(currentDate)}
        </Typography>
        <IconButton size="small" onClick={() => navigateDate('next')}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Calendar Content */}
      {viewType === 'week' ? renderWeekView() : renderMonthView()}

      {/* Today's Classes Summary */}
      {viewType === 'week' && mounted && (
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Today&apos;s Classes
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {getClassesForDate(new Date()).map((classEvent) => (
              <Box
                key={classEvent.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: classEvent.color
                  }}
                />
                <Typography variant="body2" fontWeight={600}>
                  {classEvent.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {classEvent.time}-{classEvent.endTime}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • {classEvent.location}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}