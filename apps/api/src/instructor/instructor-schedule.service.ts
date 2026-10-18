import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient, ScheduleEvent } from '@prisma/client';

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
        courseId,
        createdBy: instructorId,
        title: createDto.title,
        type: createDto.type,
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        location: createDto.location,
        color: createDto.color || course.color, // Use course color if not specified
        recurrence: createDto.recurrence || 'one-time',
        dayOfWeek: createDto.dayOfWeek,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        updatedAt: new Date()
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
            courseId,
            createdBy: instructorId,
            title: event.title,
            type: event.type,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            color: event.color || course.color,
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

  /**
   * Save current schedule as a template
   */
  async saveAsTemplate(
    instructorId: string,
    courseId: string,
    templateData: { name: string; description?: string }
  ) {
    // Get all schedule events for the course
    const scheduleEvents = await this.prisma.scheduleEvent.findMany({
      where: { courseId },
      select: {
        title: true,
        type: true,
        startTime: true,
        endTime: true,
        location: true,
        recurrence: true,
        dayOfWeek: true,
        color: true
      }
    });

    if (scheduleEvents.length === 0) {
      throw new BadRequestException('No schedule events to save as template');
    }

    // Determine pattern (e.g., MWF, TTh)
    const days = scheduleEvents
      .filter(e => e.dayOfWeek !== null)
      .map(e => e.dayOfWeek)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    
    const dayMap = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const pattern = days.map(d => dayMap[d!]).join('');

    // Create template
    const template = await this.prisma.scheduleTemplate.create({
      data: {
        userId: instructorId,
        name: templateData.name,
        description: templateData.description,
        pattern: pattern || 'Custom',
        events: scheduleEvents as any
      }
    });

    return {
      template,
      message: 'Schedule saved as template successfully'
    };
  }

  /**
   * Get all templates for instructor
   */
  async getTemplates(instructorId: string) {
    const templates = await this.prisma.scheduleTemplate.findMany({
      where: {
        OR: [
          { userId: instructorId },
          { isPublic: true }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return templates;
  }

  /**
   * Apply a template to a course
   */
  async applyTemplate(
    instructorId: string,
    courseId: string,
    templateId: string,
    startDate: string
  ) {
    // Verify course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    // Get template
    const template = await this.prisma.scheduleTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId !== instructorId && !template.isPublic) {
      throw new ForbiddenException('You do not have access to this template');
    }

    // Create schedule events from template
    const events = template.events as any[];
    const createdEvents: ScheduleEvent[] = [];

    for (const eventTemplate of events) {
      const event = await this.prisma.scheduleEvent.create({
        data: {
          courseId,
          createdBy: instructorId,
          title: eventTemplate.title,
          type: eventTemplate.type,
          startTime: eventTemplate.startTime,
          endTime: eventTemplate.endTime,
          location: eventTemplate.location,
          recurrence: eventTemplate.recurrence,
          dayOfWeek: eventTemplate.dayOfWeek,
          startDate: new Date(startDate),
          color: eventTemplate.color || course.color,
          updatedAt: new Date()
        }
      });
      createdEvents.push(event);
    }

    return {
      created: createdEvents.length,
      events: createdEvents,
      message: `Successfully applied template with ${createdEvents.length} events`
    };
  }

  /**
   * Delete a template
   */
  async deleteTemplate(instructorId: string, templateId: string) {
    const template = await this.prisma.scheduleTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId !== instructorId) {
      throw new ForbiddenException('You do not own this template');
    }

    await this.prisma.scheduleTemplate.delete({
      where: { id: templateId }
    });

    return {
      message: 'Template deleted successfully'
    };
  }
}
