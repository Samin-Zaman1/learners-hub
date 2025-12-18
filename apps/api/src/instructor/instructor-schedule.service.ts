import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface CreateScheduleEventDto {
  title: string;
  type: string; // lecture, lab, office_hours, exam, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  location?: string;
  color?: string;
  recurrence?: 'one-time' | 'weekly' | 'daily';
  dayOfWeek?: number; // 0-6 (Sunday-Saturday) for weekly recurring
  startDate: string; // ISO date string
  endDate?: string; // ISO date string - for recurring events, when to stop
}

export interface UpdateScheduleEventDto {
  title?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  color?: string;
  recurrence?: 'one-time' | 'weekly' | 'daily';
  dayOfWeek?: number;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class InstructorScheduleService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a schedule event for a course
   */
  async createScheduleEvent(instructorId: string, courseId: string, createDto: CreateScheduleEventDto) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    // Validate recurrence settings
    if (createDto.recurrence === 'weekly' && createDto.dayOfWeek === undefined) {
      throw new BadRequestException('dayOfWeek is required for weekly recurring events');
    }

    if (createDto.recurrence === 'one-time' && createDto.endDate) {
      throw new BadRequestException('endDate should not be set for one-time events');
    }

    // Create the schedule event
    const scheduleEvent = await this.prisma.scheduleEvent.create({
      data: {
        userId: instructorId,
        courseId,
        createdBy: instructorId,
        title: createDto.title,
        type: createDto.type,
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        location: createDto.location,
        color: createDto.color || course.color, // Use course color if not specified
        date: new Date(createDto.startDate), // Required field
        recurrence: createDto.recurrence || 'one-time',
        dayOfWeek: createDto.dayOfWeek,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null
      }
    });

    return {
      scheduleEvent,
      message: 'Schedule event created successfully'
    };
  }

  /**
   * Get all schedule events for a course
   */
  async getCourseSchedule(instructorId: string, courseId: string) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    const scheduleEvents = await this.prisma.scheduleEvent.findMany({
      where: { courseId },
      orderBy: [
        { startDate: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return scheduleEvents;
  }

  /**
   * Get a specific schedule event
   */
  async getScheduleEventById(instructorId: string, courseId: string, eventId: string) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    const scheduleEvent = await this.prisma.scheduleEvent.findUnique({
      where: { id: eventId },
      include: {
        Course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      }
    });

    if (!scheduleEvent || scheduleEvent.courseId !== courseId) {
      throw new NotFoundException('Schedule event not found');
    }

    return scheduleEvent;
  }

  /**
   * Update a schedule event
   */
  async updateScheduleEvent(
    instructorId: string,
    courseId: string,
    eventId: string,
    updateDto: UpdateScheduleEventDto
  ) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    // Verify event exists and belongs to course
    const scheduleEvent = await this.prisma.scheduleEvent.findUnique({
      where: { id: eventId }
    });

    if (!scheduleEvent || scheduleEvent.courseId !== courseId) {
      throw new NotFoundException('Schedule event not found');
    }

    // Validate recurrence settings if being updated
    if (updateDto.recurrence === 'weekly' && updateDto.dayOfWeek === undefined && scheduleEvent.dayOfWeek === null) {
      throw new BadRequestException('dayOfWeek is required for weekly recurring events');
    }

    // Update the event
    const updatedEvent = await this.prisma.scheduleEvent.update({
      where: { id: eventId },
      data: {
        ...updateDto,
        startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined
      }
    });

    return {
      scheduleEvent: updatedEvent,
      message: 'Schedule event updated successfully'
    };
  }

  /**
   * Delete a schedule event
   */
  async deleteScheduleEvent(instructorId: string, courseId: string, eventId: string) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    // Verify event exists and belongs to course
    const scheduleEvent = await this.prisma.scheduleEvent.findUnique({
      where: { id: eventId }
    });

    if (!scheduleEvent || scheduleEvent.courseId !== courseId) {
      throw new NotFoundException('Schedule event not found');
    }

    await this.prisma.scheduleEvent.delete({
      where: { id: eventId }
    });

    return {
      message: 'Schedule event deleted successfully'
    };
  }

  /**
   * Bulk create schedule events (useful for creating recurring events or semester schedules)
   */
  async bulkCreateScheduleEvents(instructorId: string, courseId: string, events: CreateScheduleEventDto[]) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    const createdEvents = await Promise.all(
      events.map(event =>
        this.prisma.scheduleEvent.create({
          data: {
            userId: instructorId,
            courseId,
            createdBy: instructorId,
            title: event.title,
            type: event.type,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            color: event.color || course.color,
            date: new Date(event.startDate), // Required field
            recurrence: event.recurrence || 'one-time',
            dayOfWeek: event.dayOfWeek,
            startDate: new Date(event.startDate),
            endDate: event.endDate ? new Date(event.endDate) : null
          }
        })
      )
    );

    return {
      scheduleEvents: createdEvents,
      count: createdEvents.length,
      message: `${createdEvents.length} schedule events created successfully`
    };
  }

  /**
   * Get schedule statistics for a course
   */
  async getScheduleStatistics(instructorId: string, courseId: string) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    const events = await this.prisma.scheduleEvent.findMany({
      where: { courseId }
    });

    const total = events.length;
    const oneTime = events.filter(e => e.recurrence === 'one-time').length;
    const weekly = events.filter(e => e.recurrence === 'weekly').length;
    const daily = events.filter(e => e.recurrence === 'daily').length;

    // Count by type
    const eventsByType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      oneTime,
      weekly,
      daily,
      byType: eventsByType
    };
  }
}
