'use client';

import { useMemo } from 'react';
import { ScheduleEvent as ComponentEvent } from '../components/shared/ScheduleComponent';
import { 
  useWeekSchedule, 
  useScheduleEvents,
  ScheduleEvent as APIEvent 
} from './useSchedule';

export interface UseScheduleDataOptions {
  studentId?: string;
  courseFilter?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Transform API event to component format
const transformEvent = (event: APIEvent): ComponentEvent => {
  // Extract date from the date field (which is already in YYYY-MM-DD format or a Date object)
  const eventDate = typeof event.date === 'string' ? event.date : new Date(event.date).toISOString().split('T')[0];
  
  // startTime and endTime are already in HH:MM format from backend
  const time = event.startTime;

  // Map API type to component type
  const typeMap: Record<string, ComponentEvent['type']> = {
    'class': 'class',
    'lecture': 'class',
    'exam': 'exam',
    'assignment': 'assignment',
    'meeting': 'meeting',
    'event': 'other',
    'other': 'other'
  };

  return {
    id: parseInt(event.id) || Math.random(),
    title: event.course ? `${event.course.title}` : event.title,
    date: eventDate,
    time: time,
    type: typeMap[event.type.toLowerCase()] || 'other',
    description: event.location ? `${event.location}` : undefined,
    color: event.course?.color || event.color
  };
};

export function useScheduleData(options: UseScheduleDataOptions = {}) {
  // Use all events if we have filters, otherwise use week schedule
  const shouldUseAllEvents = options.courseFilter || options.dateRange;
  
  const { data: weekEvents, isLoading: weekLoading, error: weekError, refetch: weekRefetch } = useWeekSchedule();
  const { data: allEvents, isLoading: allLoading, error: allError, refetch: allRefetch } = useScheduleEvents(
    shouldUseAllEvents ? {} : undefined
  );

  const events = useMemo(() => {
    const sourceEvents = shouldUseAllEvents ? allEvents : weekEvents;
    if (!sourceEvents) return [];
    
    // Ensure sourceEvents is an array
    if (!Array.isArray(sourceEvents)) {
      console.error('Schedule API returned non-array data:', sourceEvents);
      return [];
    }

    let filteredEvents = sourceEvents.map(transformEvent);
    
    // Apply course filter if provided
    if (options.courseFilter && options.courseFilter.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        options.courseFilter!.some(course => 
          event.title.toLowerCase().includes(course.toLowerCase())
        )
      );
    }
    
    // Apply date range filter if provided
    if (options.dateRange) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= options.dateRange!.start && eventDate <= options.dateRange!.end;
      });
    }
    
    return filteredEvents;
  }, [shouldUseAllEvents, allEvents, weekEvents, options.courseFilter, options.dateRange]);

  const isLoading = shouldUseAllEvents ? allLoading : weekLoading;
  const error = shouldUseAllEvents ? allError : weekError;
  const refetch = shouldUseAllEvents ? allRefetch : weekRefetch;

  return {
    events,
    loading: isLoading,
    error: error ? 'Failed to fetch schedule data' : null,
    refetch
  };
}

export function useScheduleDataForPage(pageType: 'dashboard' | 'schedule' | 'course') {
  const baseData = useScheduleData();
  
  // Customize configuration based on page type
  const getVariantConfig = () => {
    switch (pageType) {
      case 'dashboard':
        return {
          variant: 'compact' as const,
          defaultView: 'month' as const,
          showControls: false
        };
      case 'schedule':
        return {
          variant: 'full' as const,
          defaultView: 'week' as const,
          showControls: true
        };
      case 'course':
        return {
          variant: 'full' as const,
          defaultView: 'month' as const,
          showControls: true
        };
      default:
        return {
          variant: 'full' as const,
          defaultView: 'month' as const,
          showControls: true
        };
    }
  };

  return {
    events: baseData.events,
    loading: baseData.loading,
    error: baseData.error,
    config: getVariantConfig(),
    refetch: baseData.refetch
  };
}