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
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  CalendarMonth,
  ViewWeek,
  Event,
} from '@mui/icons-material';

export interface ScheduleEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'class' | 'exam' | 'assignment' | 'meeting' | 'other';
  color?: string;
  description?: string;
}

export interface ScheduleComponentProps {
  title?: string;
  events: ScheduleEvent[];
  variant?: 'full' | 'compact' | 'mini';
  defaultView?: 'month' | 'week';
  showControls?: boolean;
  onEventClick?: (event: ScheduleEvent) => void;
  onDateChange?: (date: Date) => void;
  eventColors?: Record<string, string>;
}

const defaultEventColors = {
  class: '#667eea',
  exam: '#ef4444',
  assignment: '#f59e0b',
  meeting: '#10b981',
  other: '#6b7280'
};

export default function ScheduleComponent({
  title = "My Schedule",
  events,
  variant = 'full',
  defaultView = 'month',
  showControls = true,
  onEventClick,
  onDateChange,
  eventColors = defaultEventColors
}: ScheduleComponentProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>(defaultView);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted || !currentDate) {
    return null;
  }

  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    if (!currentDate) return false;
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!currentDate) return;
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!currentDate) return;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    onDateChange?.(new Date());
  };

  const renderMonthView = () => {
    if (!currentDate) return null;
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <Box>
        {/* Month header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                color: 'text.secondary',
                p: 1
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <Box key={weekIndex} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return <Box key={dayIndex} sx={{ minHeight: variant === 'compact' ? 32 : 48 }} />;
              }

              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayEvents = getEventsForDate(date);
              const isTodayDate = isToday(date);

              return (
                <Box
                  key={day}
                  sx={{
                    minHeight: variant === 'compact' ? 32 : 48,
                    p: 0.5,
                    border: '1px solid #e2e8f0',
                    borderRadius: 1,
                    bgcolor: isTodayDate ? '#667eea10' : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#f1f5f9'
                    }
                  }}
                >
                  <Typography
                    variant={variant === 'compact' ? 'caption' : 'body2'}
                    sx={{
                      fontWeight: isTodayDate ? 600 : 400,
                      color: isTodayDate ? '#667eea' : 'text.primary',
                      mb: 0.5
                    }}
                  >
                    {day}
                  </Typography>
                  
                  {variant !== 'mini' && dayEvents.slice(0, variant === 'compact' ? 1 : 3).map((event) => (
                    <Box
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      sx={{
                        bgcolor: event.color || eventColors[event.type] || eventColors.other,
                        color: 'white',
                        borderRadius: 0.5,
                        px: 0.5,
                        py: 0.25,
                        mb: 0.25,
                        fontSize: '0.7rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        '&:hover': {
                          filter: 'brightness(0.9)'
                        }
                      }}
                    >
                      {event.title}
                    </Box>
                  ))}
                  
                  {variant !== 'mini' && dayEvents.length > (variant === 'compact' ? 1 : 3) && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
                      +{dayEvents.length - (variant === 'compact' ? 1 : 3)} more
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isTodayDate = isToday(day);

            return (
              <Box
                key={index}
                sx={{
                  minHeight: variant === 'compact' ? 100 : 240,
                  p: 0.75,
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  bgcolor: isTodayDate ? '#667eea10' : 'transparent'
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: isTodayDate ? '#667eea' : 'text.primary',
                    mb: 1,
                    textAlign: 'center'
                  }}
                >
                  {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                </Typography>
                
                {dayEvents.map((event) => (
                  <Box
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    sx={{
                      bgcolor: event.color || eventColors[event.type] || eventColors.other,
                      color: 'white',
                      borderRadius: 1,
                      p: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        filter: 'brightness(0.9)'
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                      {event.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {event.time}
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

  return (
    <Paper sx={{ p: variant === 'mini' ? 1.5 : (variant === 'compact' ? 1.5 : 2.5), borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: variant === 'mini' ? 1.5 : 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonth sx={{ color: '#667eea' }} />
          <Typography variant={variant === 'mini' ? 'subtitle1' : 'h6'} fontWeight={600}>
            {title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Period Filter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0'
                }
              }}
            >
              <MenuItem value="current">This Month</MenuItem>
              <MenuItem value="next">Next Month</MenuItem>
              <MenuItem value="semester">This Semester</MenuItem>
            </Select>
          </FormControl>
          
          {showControls && variant !== 'mini' && (
            <>
              <Button
                size="small"
                variant={viewMode === 'month' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('month')}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                Month
              </Button>
              <Button
                size="small"
                variant={viewMode === 'week' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('week')}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                Week
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Navigation */}
      {showControls && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
            size="small"
          >
            <ChevronLeft />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {currentDate && (viewMode === 'month' 
                ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              )}
            </Typography>
            <IconButton onClick={goToToday} size="small" title="Go to today">
              <Today />
            </IconButton>
          </Box>
          
          <IconButton 
            onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
            size="small"
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Calendar Content */}
      {viewMode === 'month' ? renderMonthView() : renderWeekView()}
    </Paper>
  );
}