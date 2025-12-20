'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Container,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components';
import { api } from '@/lib/api';

interface ScheduleEvent {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string | null;
  recurrence: 'ONE_TIME' | 'WEEKLY' | 'DAILY';
  dayOfWeek: string | null;
  date: string | null;
  startDate: string | null;
  endDate: string | null;
  course: {
    id: string;
    title: string;
    code: string;
    color: string;
  };
  actualDate?: string; // For expanded recurring events
}

interface WeekSchedule {
  [key: string]: ScheduleEvent[];
}

export default function StudentSchedulePage() {
  const [view, setView] = useState<'today' | 'week' | 'all'>('week');

  const { data: todaySchedule, isLoading: loadingToday } = useQuery<ScheduleEvent[]>({
    queryKey: ['student', 'schedule', 'today'],
    queryFn: async () => {
      const response = await api.get('/student/schedule/today');
      return response.data;
    },
    enabled: view === 'today'
  });

  const { data: weekSchedule, isLoading: loadingWeek } = useQuery<WeekSchedule>({
    queryKey: ['student', 'schedule', 'week'],
    queryFn: async () => {
      const response = await api.get('/student/schedule/week');
      return response.data.eventsByDay || {};
    },
    enabled: view === 'week'
  });

  const { data: allSchedule, isLoading: loadingAll } = useQuery<ScheduleEvent[]>({
    queryKey: ['student', 'schedule'],
    queryFn: async () => {
      const response = await api.get('/student/schedule');
      return response.data;
    },
    enabled: view === 'all'
  });

  const isLoading = loadingToday || loadingWeek || loadingAll;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LECTURE':
        return '#667eea';
      case 'LAB':
        return '#f59e0b';
      case 'TUTORIAL':
        return '#10b981';
      case 'EXAM':
        return '#ef4444';
      case 'OFFICE_HOURS':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDayName = (dayAbbrev: string) => {
    const days: { [key: string]: string } = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday',
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday',
      'SATURDAY': 'Saturday',
      'SUNDAY': 'Sunday'
    };
    return days[dayAbbrev] || dayAbbrev;
  };

  const renderEventCard = (event: ScheduleEvent) => (
    <Card
      key={event.id}
      sx={{
        borderLeft: 4,
        borderColor: event.course.color,
        bgcolor: `${event.course.color}10`,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s'
        }
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {event.title}
            </Typography>
            <Chip
              label={`${event.course.code}: ${event.course.title}`}
              size="small"
              sx={{
                bgcolor: event.course.color,
                color: 'white',
                fontSize: '0.7rem',
                height: 20
              }}
            />
          </Box>
          <Chip
            label={event.type}
            size="small"
            sx={{
              bgcolor: getTypeColor(event.type),
              color: 'white',
              fontSize: '0.65rem',
              height: 18
            }}
          />
        </Box>
        
        <Box display="flex" alignItems="center" gap={1} mt={1.5}>
          <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </Typography>
          {event.location && (
            <>
              <Typography variant="caption" color="text.secondary">•</Typography>
              <Typography variant="caption" color="text.secondary">
                {event.location}
              </Typography>
            </>
          )}
        </Box>

        {event.actualDate && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(event.actualDate)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Schedule">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Class Schedule
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View schedule events from all your enrolled courses
          </Typography>
        </Box>

        {/* View Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={view}
            onChange={(_, newValue) => setView(newValue)}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              icon={<TodayIcon />}
              label="Today"
              value="today"
              iconPosition="start"
            />
            <Tab
              icon={<CalendarIcon />}
              label="This Week"
              value="week"
              iconPosition="start"
            />
            <Tab
              icon={<EventIcon />}
              label="All Events"
              value="all"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Today View */}
        {view === 'today' && todaySchedule && (
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Today&apos;s Schedule
            </Typography>
            {todaySchedule.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <TodayIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No classes scheduled for today
                </Typography>
              </Paper>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {todaySchedule.map((event) => renderEventCard(event))}
              </Box>
            )}
          </Box>
        )}

        {/* Week View */}
        {view === 'week' && weekSchedule && (
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              This Week&apos;s Schedule
            </Typography>
            {Object.keys(weekSchedule).length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No classes scheduled this week
                </Typography>
              </Paper>
            ) : (
              <Box display="flex" flexDirection="column" gap={3}>
                {Object.entries(weekSchedule).map(([day, events]) => (
                  <Box key={day}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                      {getDayName(day)} ({Array.isArray(events) ? events.length : 0} {Array.isArray(events) && events.length === 1 ? 'event' : 'events'})
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      {Array.isArray(events) && events.map((event) => renderEventCard(event))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* All Events View */}
        {view === 'all' && allSchedule && (
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              All Schedule Events ({allSchedule.length})
            </Typography>
            {allSchedule.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No schedule events found
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Your instructors will add class schedules that will appear here
                </Typography>
              </Paper>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {allSchedule.map((event) => (
                  <Card
                    key={event.id}
                    sx={{
                      borderLeft: 4,
                      borderColor: event.course.color,
                      bgcolor: `${event.course.color}10`
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            {event.title}
                          </Typography>
                          <Chip
                            label={`${event.course.code}: ${event.course.title}`}
                            size="small"
                            sx={{
                              bgcolor: event.course.color,
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 20,
                              mb: 1
                            }}
                          />
                        </Box>
                        <Box display="flex" gap={0.5}>
                          <Chip
                            label={event.type}
                            size="small"
                            sx={{
                              bgcolor: getTypeColor(event.type),
                              color: 'white',
                              fontSize: '0.65rem',
                              height: 18
                            }}
                          />
                          <Chip
                            label={event.recurrence}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem', height: 18 }}
                          />
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </Typography>
                        </Box>
                        
                        {event.dayOfWeek && (
                          <Typography variant="caption" color="text.secondary">
                            {getDayName(event.dayOfWeek)}
                          </Typography>
                        )}
                        
                        {event.location && (
                          <Typography variant="caption" color="text.secondary">
                            📍 {event.location}
                          </Typography>
                        )}
                        
                        {event.recurrence !== 'ONE_TIME' && event.startDate && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(event.startDate)} → {event.endDate ? formatDate(event.endDate) : 'Ongoing'}
                          </Typography>
                        )}
                        
                        {event.recurrence === 'ONE_TIME' && event.date && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(event.date)}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
}
