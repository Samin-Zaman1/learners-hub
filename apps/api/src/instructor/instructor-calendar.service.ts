import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface CalendarEvent {
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
  recurrence?: string;
}

@Injectable()
export class InstructorCalendarService {
  private prisma = new PrismaClient();

  /**
   * Get all schedule events for a specific month
   */
  async getMonthlySchedule(instructorId: string, year: number, month: number) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Access denied');
    }

    // Calculate month boundaries
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const events = await this.prisma.scheduleEvent.findMany({
      where: { Course: { instructorId },
        OR: [
          {
            // One-time events within the month
            recurrence: 'one-time',
            startDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            // Recurring events that started before or during this month
            recurrence: { not: 'one-time' },
            startDate: { lte: endDate },
            OR: [
              { endDate: null }, // No end date
              { endDate: { gte: startDate } } // Or ends after month start
            ]
          }
        ]
      },
      include: {
        Course: {
          include: {
            Enrollment: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    // Expand recurring events for the month
    const expandedEvents: CalendarEvent[] = [];
    
    events.forEach(event => {
      if (event.recurrence === 'one-time') {
        expandedEvents.push(this.mapToCalendarEvent(event));
      } else {
        // Expand recurring events
        const recurring = this.expandRecurringEvent(event, startDate, endDate);
        expandedEvents.push(...recurring);
      }
    });

    // Group by date
    const eventsByDate: Record<string, CalendarEvent[]> = {};
    expandedEvents.forEach(event => {
      const dateKey = event.date.toISOString().split('T')[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    return {
      year,
      month,
      eventsByDate,
      totalEvents: expandedEvents.length
    };
  }

  /**
   * Get schedule for a specific week
   */
  async getWeeklySchedule(instructorId: string, startDate: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Access denied');
    }

    const weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const events = await this.prisma.scheduleEvent.findMany({
      where: { Course: { instructorId },
        OR: [
          {
            recurrence: 'one-time',
            startDate: {
              gte: weekStart,
              lte: weekEnd
            }
          },
          {
            recurrence: { not: 'one-time' },
            startDate: { lte: weekEnd },
            OR: [
              { endDate: null },
              { endDate: { gte: weekStart } }
            ]
          }
        ]
      },
      include: {
        Course: {
          include: {
            Enrollment: true
          }
        }
      }
    });

    const expandedEvents: CalendarEvent[] = [];
    
    events.forEach(event => {
      if (event.recurrence === 'one-time') {
        expandedEvents.push(this.mapToCalendarEvent(event));
      } else {
        const recurring = this.expandRecurringEvent(event, weekStart, weekEnd);
        expandedEvents.push(...recurring);
      }
    });

    // Group by day of week
    const eventsByDay: Record<string, CalendarEvent[]> = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dateKey = day.toISOString().split('T')[0];
      eventsByDay[dateKey] = [];
    }

    expandedEvents.forEach(event => {
      const dateKey = event.date.toISOString().split('T')[0];
      if (eventsByDay[dateKey]) {
        eventsByDay[dateKey].push(event);
      }
    });

    return {
      weekStart,
      weekEnd,
      eventsByDay
    };
  }

  /**
   * Get all events for a specific day
   */
  async getDailySchedule(instructorId: string, date: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Access denied');
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const events = await this.prisma.scheduleEvent.findMany({
      where: { Course: { instructorId },
        OR: [
          {
            recurrence: 'one-time',
            startDate: {
              gte: targetDate,
              lte: dayEnd
            }
          },
          {
            recurrence: { not: 'one-time' },
            startDate: { lte: dayEnd },
            OR: [
              { endDate: null },
              { endDate: { gte: targetDate } }
            ]
          }
        ]
      },
      include: {
        Course: {
          include: {
            Enrollment: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const expandedEvents: CalendarEvent[] = [];
    
    events.forEach(event => {
      if (event.recurrence === 'one-time') {
        if (!event.startDate) return;
        const eventDate = new Date(event.startDate);
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate.getTime() === targetDate.getTime()) {
          expandedEvents.push(this.mapToCalendarEvent(event));
        }
      } else {
        const recurring = this.expandRecurringEvent(event, targetDate, dayEnd);
        expandedEvents.push(...recurring);
      }
    });

    // Sort by time
    expandedEvents.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    return {
      date: targetDate,
      events: expandedEvents,
      totalEvents: expandedEvents.length
    };
  }

  /**
   * Get upcoming events for the next N days
   */
  async getUpcomingEvents(instructorId: string, days: number = 7) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Access denied');
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);
    futureDate.setHours(23, 59, 59, 999);

    const events = await this.prisma.scheduleEvent.findMany({
      where: { Course: { instructorId },
        OR: [
          {
            recurrence: 'one-time',
            startDate: {
              gte: now,
              lte: futureDate
            }
          },
          {
            recurrence: { not: 'one-time' },
            startDate: { lte: futureDate },
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      include: {
        Course: {
          include: {
            Enrollment: true
          }
        }
      }
    });

    const expandedEvents: CalendarEvent[] = [];
    
    events.forEach(event => {
      if (event.recurrence === 'one-time') {
        expandedEvents.push(this.mapToCalendarEvent(event));
      } else {
        const recurring = this.expandRecurringEvent(event, now, futureDate);
        expandedEvents.push(...recurring);
      }
    });

    // Sort by date and time
    expandedEvents.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    return expandedEvents;
  }

  /**
   * Map schedule event to calendar event
   */
  private mapToCalendarEvent(event: any): CalendarEvent {
    return {
      id: event.id,
      title: event.title,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      date: event.startDate ? new Date(event.startDate) : event.date,
      location: event.location,
      color: event.color,
      courseId: event.courseId,
      courseName: event.Course.title,
      courseCode: event.Course.code,
      studentCount: event.Course.enrollments?.length || 0,
      recurrence: event.recurrence
    };
  }

  /**
   * Expand recurring events within a date range
   */
  private expandRecurringEvent(event: any, startDate: Date, endDate: Date): CalendarEvent[] {
    const expanded: CalendarEvent[] = [];
    if (!event.startDate) return expanded;
    const eventStartDate = new Date(event.startDate);
    const eventEndDate = event.endDate ? new Date(event.endDate) : endDate;

    if (event.recurrence === 'weekly' && event.dayOfWeek !== null) {
      // Find first occurrence on or after startDate
      let currentDate = new Date(Math.max(eventStartDate.getTime(), startDate.getTime()));
      currentDate.setHours(0, 0, 0, 0);

      // Move to the correct day of week
      while (currentDate.getDay() !== event.dayOfWeek && currentDate <= endDate) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Add occurrences
      while (currentDate <= endDate && currentDate <= eventEndDate) {
        if (currentDate >= startDate) {
          expanded.push({
            ...this.mapToCalendarEvent(event),
            date: new Date(currentDate)
          });
        }
        currentDate.setDate(currentDate.getDate() + 7);
      }
    } else if (event.recurrence === 'daily') {
      let currentDate = new Date(Math.max(eventStartDate.getTime(), startDate.getTime()));
      currentDate.setHours(0, 0, 0, 0);

      while (currentDate <= endDate && currentDate <= eventEndDate) {
        if (currentDate >= startDate) {
          expanded.push({
            ...this.mapToCalendarEvent(event),
            date: new Date(currentDate)
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return expanded;
  }

  /**
   * Get calendar statistics
   */
  async getCalendarStats(instructorId: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Access denied');
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [todayEvents, weekEvents, totalEvents] = await Promise.all([
      this.getDailySchedule(instructorId, todayStart.toISOString()),
      this.getWeeklySchedule(instructorId, weekStart.toISOString()),
      this.prisma.scheduleEvent.count({
        where: { Course: { instructorId } }
      })
    ]);

    const weekEventCount = Object.values(weekEvents.eventsByDay).reduce(
      (sum, events) => sum + events.length,
      0
    );

    return {
      todayEvents: todayEvents.totalEvents,
      weekEvents: weekEventCount,
      totalEvents,
      nextEvent: (await this.getUpcomingEvents(instructorId, 1))[0] || null
    };
  }
}
