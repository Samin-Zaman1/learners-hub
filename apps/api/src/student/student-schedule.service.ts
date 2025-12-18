import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface ExpandedScheduleEvent {
  id: string;
  title: string;
  type: string;
  date: Date; // The actual date this event occurs
  startTime: string;
  endTime: string;
  location: string | null;
  color: string;
  courseId: string;
  Course: {
    id: string;
    title: string;
    code: string;
    color: string;
  };
  isRecurring: boolean;
  recurrence: string | null;
}

@Injectable()
export class StudentScheduleService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all schedule events from enrolled courses
   * Expands recurring events into actual dates
   */
  async getStudentSchedule(studentId: string, startDate?: Date, endDate?: Date) {
    // Get all enrolled courses
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: studentId },
      select: { courseId: true }
    });

    const courseIds = enrollments.map(e => e.courseId);

    // Get all schedule events from enrolled courses
    const scheduleEvents = await this.prisma.scheduleEvent.findMany({
      where: {
        courseId: { in: courseIds }
      },
      include: {
        Course: {
          select: {
            id: true,
            title: true,
            code: true,
            color: true
          }
        }
      },
      orderBy: [
        { startDate: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Expand recurring events
    const expandedEvents = this.expandRecurringEvents(
      scheduleEvents,
      startDate || new Date(),
      endDate || this.getDateDaysFromNow(90) // Default to 90 days ahead
    );

    return expandedEvents;
  }

  /**
   * Get today's schedule
   */
  async getTodaySchedule(studentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await this.getStudentSchedule(studentId, today, tomorrow);
    
    return events.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  /**
   * Get this week's schedule (Monday-Sunday)
   */
  async getWeekSchedule(studentId: string) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    // Get Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    const events = await this.getStudentSchedule(studentId, monday, sunday);
    
    // Return events sorted by date and time
    return events.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Get schedule for a specific date range
   */
  async getScheduleForDateRange(studentId: string, startDate: Date, endDate: Date) {
    return this.getStudentSchedule(studentId, startDate, endDate);
  }

  /**
   * Get upcoming events (next 7 days)
   */
  async getUpcomingEvents(studentId: string, daysAhead: number = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysAhead);

    const events = await this.getStudentSchedule(studentId, today, futureDate);
    
    return events
      .sort((a, b) => {
        const dateCompare = a.date.getTime() - b.date.getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 10); // Return top 10 upcoming events
  }

  /**
   * Expand recurring events into actual date instances
   */
  private expandRecurringEvents(
    events: any[],
    startDate: Date,
    endDate: Date
  ): ExpandedScheduleEvent[] {
    const expanded: ExpandedScheduleEvent[] = [];

    events.forEach(event => {
      if (event.recurrence === 'one-time') {
        // One-time event
        const eventDate = new Date(event.startDate);
        if (eventDate >= startDate && eventDate <= endDate) {
          expanded.push({
            id: event.id,
            title: event.title,
            type: event.type,
            date: eventDate,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            color: event.color,
            courseId: event.courseId,
            Course: event.Course,
            isRecurring: false,
            recurrence: null
          });
        }
      } else if (event.recurrence === 'weekly') {
        // Weekly recurring event
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = event.endDate ? new Date(event.endDate) : endDate;
        const targetDayOfWeek = event.dayOfWeek;

        // Find first occurrence on or after start date
        let currentDate = new Date(Math.max(eventStartDate.getTime(), startDate.getTime()));
        const daysUntilTarget = (targetDayOfWeek - currentDate.getDay() + 7) % 7;
        currentDate.setDate(currentDate.getDate() + daysUntilTarget);

        // Generate all occurrences
        while (currentDate <= endDate && currentDate <= eventEndDate) {
          if (currentDate >= startDate) {
            expanded.push({
              id: `${event.id}-${currentDate.toISOString().split('T')[0]}`,
              title: event.title,
              type: event.type,
              date: new Date(currentDate),
              startTime: event.startTime,
              endTime: event.endTime,
              location: event.location,
              color: event.color,
              courseId: event.courseId,
              Course: event.Course,
              isRecurring: true,
              recurrence: 'weekly'
            });
          }
          currentDate.setDate(currentDate.getDate() + 7); // Next week
        }
      } else if (event.recurrence === 'daily') {
        // Daily recurring event
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = event.endDate ? new Date(event.endDate) : endDate;

        let currentDate = new Date(Math.max(eventStartDate.getTime(), startDate.getTime()));

        // Generate all occurrences
        while (currentDate <= endDate && currentDate <= eventEndDate) {
          if (currentDate >= startDate) {
            expanded.push({
              id: `${event.id}-${currentDate.toISOString().split('T')[0]}`,
              title: event.title,
              type: event.type,
              date: new Date(currentDate),
              startTime: event.startTime,
              endTime: event.endTime,
              location: event.location,
              color: event.color,
              courseId: event.courseId,
              Course: event.Course,
              isRecurring: true,
              recurrence: 'daily'
            });
          }
          currentDate.setDate(currentDate.getDate() + 1); // Next day
        }
      }
    });

    return expanded;
  }

  /**
   * Helper to get date N days from now
   */
  private getDateDaysFromNow(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}
