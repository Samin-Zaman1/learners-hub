'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  CalendarMonth,
  ViewWeek,
  ViewDay,
  Add,
  LocationOn,
  People,
  AccessTime,
  Event as EventIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components';
import { useRouter } from 'next/navigation';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  date: Date;
  location?: string;
  color: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studentCount: number;
}

export default function InstructorCalendar() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
  }, []);

  // Return loading state if not mounted yet
  if (!mounted || !currentDate) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography>Loading calendar...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Get start of week for weekly view
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);

  // Fetch calendar data based on view mode
  const { data: monthData, isLoading: loadingMonth } = useQuery({
    queryKey: ['instructor', 'calendar', 'month', year, month],
    queryFn: async () => {
      const response = await api.get(`/instructor/calendar/monthly/${year}/${month}`);
      return response.data;
    },
    enabled: viewMode === 'month'
  });

  const { data: weekData, isLoading: loadingWeek } = useQuery({
    queryKey: ['instructor', 'calendar', 'week', weekStart.toISOString()],
    queryFn: async () => {
      const response = await api.get(`/instructor/calendar/weekly?startDate=${weekStart.toISOString()}`);
      return response.data;
    },
    enabled: viewMode === 'week'
  });

  const { data: dayData, isLoading: loadingDay } = useQuery({
    queryKey: ['instructor', 'calendar', 'day', currentDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await api.get(`/instructor/calendar/daily/${currentDate.toISOString().split('T')[0]}`);
      return response.data;
    },
    enabled: viewMode === 'day'
  });

  const { data: calendarStats } = useQuery({
    queryKey: ['instructor', 'calendar', 'stats'],
    queryFn: async () => {
      const response = await api.get('/instructor/calendar/stats');
      return response.data;
    }
  });

  const isLoading = loadingMonth || loadingWeek || loadingDay;

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      class: '#2196f3',
      lab: '#4caf50',
      exam: '#f44336',
      'office-hours': '#ff9800',
    };
    return colors[type] || '#9e9e9e';
  };

  const renderEventCard = (event: CalendarEvent) => (
    <Card
      key={event.id}
      sx={{
        mb: 1,
        borderLeft: 4,
        borderColor: event.color || getEventTypeColor(event.type),
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
        },
      }}
      onClick={() => router.push(`/instructor/courses/${event.courseId}/schedule`)}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {event.title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
              <Chip
                label={event.courseCode}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
              <Chip
                label={event.type}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Stack>
          </Box>
        </Box>
        <Stack direction="row" spacing={2} mt={1}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {event.startTime} - {event.endTime}
            </Typography>
          </Box>
          {event.location && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {event.location}
              </Typography>
            </Box>
          )}
          <Box display="flex" alignItems="center" gap={0.5}>
            <People sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {event.studentCount} students
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderMonthView = () => {
    if (!monthData) return null;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<Box key={`empty-${i}`} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      const dayEvents = monthData.eventsByDate?.[dateKey] || [];
      const isToday =
        date.toDateString() === new Date().toDateString();

      days.push(
        <Paper
          key={day}
          sx={{
            p: 1,
            minHeight: 120,
            bgcolor: isToday ? 'primary.50' : 'background.paper',
            border: isToday ? 2 : 1,
            borderColor: isToday ? 'primary.main' : 'divider',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => {
            setCurrentDate(date);
            setViewMode('day');
          }}
        >
          <Typography
            variant="body2"
            fontWeight={isToday ? 700 : 400}
            color={isToday ? 'primary.main' : 'text.primary'}
            mb={0.5}
          >
            {day}
          </Typography>
          <Box>
            {dayEvents.slice(0, 3).map((event: CalendarEvent) => (
              <Box
                key={event.id}
                sx={{
                  p: 0.5,
                  mb: 0.5,
                  bgcolor: event.color || getEventTypeColor(event.type),
                  borderRadius: 0.5,
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/instructor/courses/${event.courseId}/schedule`);
                }}
              >
                <Typography variant="caption" color="white" noWrap display="block">
                  {event.startTime} {event.title}
                </Typography>
              </Box>
            ))}
            {dayEvents.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{dayEvents.length - 3} more
              </Typography>
            )}
          </Box>
        </Paper>
      );
    }

    return (
      <Box>
        <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1} sx={{ mb: 1 }}>
          {dayNames.map((name) => (
            <Box key={name}>
              <Typography
                variant="subtitle2"
                textAlign="center"
                fontWeight={600}
                color="text.secondary"
              >
                {name}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1}>
          {days.map((day, index) => (
            <Box key={index}>
              {day}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderWeekView = () => {
    if (!weekData) return null;

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }

    return (
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(7, 1fr)' }} gap={2}>
        {weekDays.map((day) => {
          const dateKey = day.toISOString().split('T')[0];
          const dayEvents = weekData.eventsByDay?.[dateKey] || [];
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <Box key={dateKey}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: isToday ? 'primary.50' : 'background.paper',
                  border: isToday ? 2 : 1,
                  borderColor: isToday ? 'primary.main' : 'divider',
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color={isToday ? 'primary.main' : 'text.primary'}
                  gutterBottom
                >
                  {day.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Typography>
                {dayEvents.length > 0 ? (
                  dayEvents.map((event: CalendarEvent) => renderEventCard(event))
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No events
                  </Typography>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderDayView = () => {
    if (!dayData) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
        {dayData.events && dayData.events.length > 0 ? (
          <Box>
            {dayData.events.map((event: CalendarEvent) => renderEventCard(event))}
          </Box>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No events scheduled for this day
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };

  const getTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } else if (viewMode === 'week') {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  return (
    <DashboardLayout title="Calendar">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" component="h1">
            {getTitle()}
          </Typography>
          {calendarStats && (
            <Chip
              label={`${calendarStats.todayEvents} event${calendarStats.todayEvents !== 1 ? 's' : ''} today`}
              color="primary"
              size="small"
            />
          )}
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<Today />}
            onClick={handleToday}
            size="small"
          >
            Today
          </Button>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="month">
              <Tooltip title="Month View">
                <CalendarMonth />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="week">
              <Tooltip title="Week View">
                <ViewWeek />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="day">
              <Tooltip title="Day View">
                <ViewDay />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" gap={1}>
          <IconButton onClick={handlePrevious} size="small">
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={handleNext} size="small">
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Calendar Content */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => router.push('/instructor/courses')}
      >
        <Add />
      </Fab>
    </DashboardLayout>
  );
}
