'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, IconButton, FormControl, Select, MenuItem } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'class' | 'exam' | 'assignment' | 'meeting' | 'other';
  color?: string;
  description?: string;
  duration?: number;
}

interface WeekCalendarProps {
  title?: string;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export default function WeekCalendar({ title = "My Schedule", events, onEventClick }: WeekCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
  }, [events]);

  if (!mounted || !currentDate) {
    return null;
  }

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventColor = (type: string, customColor?: string) => {
    if (customColor) return customColor;
    switch (type) {
      case 'class': return '#3b82f6';
      case 'exam': return '#ef4444';
      case 'assignment': return '#10b981';
      case 'meeting': return '#8b5cf6';
      default: return '#667eea';
    }
  };

  const getEventsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return events.filter(event => {
      const eventDateStr = event.date.includes('T') 
        ? event.date.split('T')[0]
        : event.date;
      return eventDateStr === dateStr;
    });
  };

  const getTimePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60;
    return ((totalMinutes - startMinutes) / 60) * 150;
  };

  const getEventWidth = (duration: number = 60) => {
    return (duration / 60) * 150 - 4;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const daysToRender = viewMode === 'week' ? getWeekDays() : getMonthDays();
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

  return (
    <Paper sx={{ p: 2, borderRadius: 7, height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'month' | 'week')}
              sx={{
                borderRadius: 10,
                bgcolor: '#f8fafc',
                fontSize: '0.85rem',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSelect-select': { py: 0.5, px: 2 }
              }}
            >
              <MenuItem value="week">Week View</MenuItem>
              <MenuItem value="month">Month View</MenuItem>
            </Select>
          </FormControl>
          <IconButton size="small" onClick={() => navigate('prev')}>
            <ChevronLeft />
          </IconButton>
          <IconButton size="small" onClick={goToToday}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Today</Typography>
          </IconButton>
          <IconButton size="small" onClick={() => navigate('next')}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Timeline Grid Container */}
      <Box sx={{ display: 'flex', gap: 1, height: 550 }}>
        {/* Date Column (Y-axis) - Separate from main grid */}
        <Box sx={{ 
          width: 100,
          bgcolor: '#f9fafb',
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Corner cell */}
          <Box sx={{ 
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f1f5f9',
            borderRadius: '8px 8px 0 0'
          }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
              Date
            </Typography>
          </Box>
          
          {/* Date rows */}
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { 
              bgcolor: 'transparent',
              borderRadius: '3px'
            },
            '&:hover::-webkit-scrollbar-thumb': { 
              bgcolor: '#cbd5e1'
            }
          }}>
            {daysToRender.map((day, index) => (
              <Box
                key={index}
                sx={{
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 1,
                  borderBottom: index === daysToRender.length - 1 ? 'none' : '1px solid transparent'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                  {day.getDate()}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Time Grid (X-axis with vertical lines) */}
        <Box sx={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          bgcolor: 'white',
          minWidth: 0
        }}>
          {/* Time header */}
          <Box sx={{ 
            height: 50,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            bgcolor: '#f9fafb',
            overflowX: 'auto',
            maxWidth: 1050,
            '&::-webkit-scrollbar': { height: '6px' },
            '&::-webkit-scrollbar-track': { bgcolor: '#f1f5f9' },
            '&::-webkit-scrollbar-thumb': { 
              bgcolor: '#cbd5e1',
              borderRadius: '3px'
            },
            '&:hover::-webkit-scrollbar-thumb': { 
              bgcolor: '#94a3b8'
            }
          }}>
            {timeSlots.map((hour) => (
              <Box
                key={hour}
                sx={{
                  minWidth: 150,
                  width: 150,
                  borderRight: hour === timeSlots[timeSlots.length - 1] ? 'none' : '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.75rem' }}>
                  {hour}:00
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Event grid */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'auto',
            maxWidth: 1050,
            '&::-webkit-scrollbar': { width: '6px', height: '6px' },
            '&::-webkit-scrollbar-track': { bgcolor: '#f1f5f9' },
            '&::-webkit-scrollbar-thumb': { 
              bgcolor: '#cbd5e1',
              borderRadius: '3px'
            },
            '&:hover::-webkit-scrollbar-thumb': { 
              bgcolor: '#94a3b8'
            },
            '&::-webkit-scrollbar-corner': { bgcolor: '#f1f5f9' }
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: timeSlots.length * 150 }}>
              {daysToRender.map((day, dayIndex) => {
                const dayEvents = getEventsForDate(day);
                return (
                  <Box
                    key={dayIndex}
                    sx={{
                      height: 90,
                      borderBottom: dayIndex < daysToRender.length - 1 ? '1px solid #e5e7eb' : 'none',
                      display: 'flex',
                      position: 'relative',
                      bgcolor: 'white'
                    }}
                  >
                    {/* Time column backgrounds with vertical lines */}
                    {timeSlots.map((hour, hourIndex) => (
                      <Box
                        key={hour}
                        sx={{
                          minWidth: 150,
                          width: 150,
                          borderRight: hourIndex === timeSlots.length - 1 ? 'none' : '1px solid #e5e7eb',
                          flexShrink: 0
                        }}
                      />
                    ))}

                    {/* Events positioned absolutely */}
                    {dayEvents.map((event, eventIndex) => {
                      const left = getTimePosition(event.time);
                      const width = getEventWidth(event.duration || 60);
                      const color = getEventColor(event.type, event.color);
                      
                      return (
                        <Box
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          sx={{
                            position: 'absolute',
                            left: `${left}px`,
                            top: 6 + (eventIndex * 50),
                            width: `${width}px`,
                            height: 44,
                            bgcolor: color,
                            color: 'white',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'all 0.2s',
                            boxShadow: `0 2px 4px ${color}40`,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: `0 4px 12px ${color}60`,
                              zIndex: 10
                            }
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.3
                            }}
                          >
                            {event.title}
                          </Typography>
                          {event.description && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                opacity: 0.95,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.3,
                                mt: 0.25
                              }}
                            >
                              {event.description}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
