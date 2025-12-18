import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type?: 'URGENT' | 'GENERAL' | 'EVENT' | 'REMINDER';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  hasAttachment?: boolean;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: 'URGENT' | 'GENERAL' | 'EVENT' | 'REMINDER';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  hasAttachment?: boolean;
}

@Injectable()
export class InstructorAnnouncementService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create an announcement for a course
   */
  async createAnnouncement(instructorId: string, courseId: string, createDto: CreateAnnouncementDto) {
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

    // Create the announcement
    const announcement = await this.prisma.announcement.create({
      data: {
        courseId,
        author: instructorId,
        title: createDto.title,
        content: createDto.content,
        type: createDto.type || 'GENERAL',
        priority: createDto.priority || 'MEDIUM',
        hasAttachment: createDto.hasAttachment || false,
        updatedAt: new Date()
      }
    });

    // If urgent, create activity records for all enrolled students
    if (createDto.type === 'URGENT') {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { courseId },
        select: { userId: true }
      });

      await Promise.all(
        enrollments.map(enrollment =>
          this.prisma.activity.create({
            data: {
              userId: enrollment.userId,
              courseId,
              type: 'ANNOUNCEMENT',
              title: `📢 Urgent: ${createDto.title}`,
              description: createDto.content.substring(0, 200),
              timestamp: new Date(),
              status: 'PENDING'
            }
          })
        )
      );
    }

    return {
      announcement,
      message: 'Announcement created successfully'
    };
  }

  /**
   * Get all announcements for a course
   */
  async getCourseAnnouncements(instructorId: string, courseId: string) {
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

    const announcements = await this.prisma.announcement.findMany({
      where: { courseId },
      include: {
        Course: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return announcements;
  }

  /**
   * Get a specific announcement
   */
  async getAnnouncementById(instructorId: string, courseId: string, announcementId: string) {
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

    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
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

    if (!announcement || announcement.courseId !== courseId) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  /**
   * Update an announcement
   */
  async updateAnnouncement(
    instructorId: string,
    courseId: string,
    announcementId: string,
    updateDto: UpdateAnnouncementDto
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

    // Verify announcement exists and belongs to course
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId }
    });

    if (!announcement || announcement.courseId !== courseId) {
      throw new NotFoundException('Announcement not found');
    }

    // Update the announcement
    const updatedAnnouncement = await this.prisma.announcement.update({
      where: { id: announcementId },
      data: updateDto
    });

    return {
      announcement: updatedAnnouncement,
      message: 'Announcement updated successfully'
    };
  }

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(instructorId: string, courseId: string, announcementId: string) {
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

    // Verify announcement exists and belongs to course
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId }
    });

    if (!announcement || announcement.courseId !== courseId) {
      throw new NotFoundException('Announcement not found');
    }

    await this.prisma.announcement.delete({
      where: { id: announcementId }
    });

    return {
      message: 'Announcement deleted successfully'
    };
  }

  /**
   * Toggle pin status of an announcement
   */
  async togglePin(instructorId: string, courseId: string, announcementId: string) {
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

    // Verify announcement exists and belongs to course
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId }
    });

    if (!announcement || announcement.courseId !== courseId) {
      throw new NotFoundException('Announcement not found');
    }

    const updated = await this.prisma.announcement.update({
      where: { id: announcementId },
      data: {
        priority: announcement.priority === 'HIGH' ? 'MEDIUM' : 'HIGH',
        updatedAt: new Date()
      }
    });

    return {
      announcement: updated,
      message: updated.priority === 'HIGH' ? 'Announcement priority set to HIGH' : 'Announcement priority set to MEDIUM'
    };
  }

  /**
   * Get announcement statistics for a course
   */
  async getAnnouncementStatistics(instructorId: string, courseId: string) {
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

    const announcements = await this.prisma.announcement.findMany({
      where: { courseId }
    });

    const total = announcements.length;
    const highPriority = announcements.filter(a => a.priority === 'HIGH').length;
    const urgent = announcements.filter(a => a.type === 'URGENT').length;
    const general = announcements.filter(a => a.type === 'GENERAL').length;
    const events = announcements.filter(a => a.type === 'EVENT').length;
    const reminders = announcements.filter(a => a.type === 'REMINDER').length;

    // Get recent announcements (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = announcements.filter(a => new Date(a.createdAt) >= sevenDaysAgo).length;

    return {
      total,
      highPriority,
      byType: {
        urgent,
        general,
        events,
        reminders
      },
      recentCount: recent
    };
  }
}
