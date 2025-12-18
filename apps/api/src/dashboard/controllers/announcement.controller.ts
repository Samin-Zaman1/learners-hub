import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementController {
  @Get('recent')
  async getRecentAnnouncements(@Request() req: any) {
    // Get all courses the user is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.userId },
      select: { courseId: true }
    });

    const courseIds = enrollments.map(e => e.courseId);

    const announcements = await prisma.announcement.findMany({
      where: {
        courseId: { in: courseIds }
      },
      include: {
        Course: {
          select: {
            title: true,
            code: true,
            color: true
          }
        },
        AnnouncementRead: {
          where: { userId: req.user.userId }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return announcements.map(announcement => ({
      ...announcement,
      isRead: announcement.AnnouncementRead.length > 0
    }));
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    // Get all courses the user is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.userId },
      select: { courseId: true }
    });

    const courseIds = enrollments.map(e => e.courseId);

    // Get unread announcements count
    const unreadCount = await prisma.announcement.count({
      where: {
        courseId: { in: courseIds },
        AnnouncementRead: {
          none: {
            userId: req.user.userId
          }
        }
      }
    });

    return { count: unreadCount };
  }

  @Get('course/:courseId')
  async getCourseAnnouncements(
    @Request() req: any,
    @Param('courseId') courseId: string
  ) {
    const announcements = await prisma.announcement.findMany({
      where: { courseId },
      include: {
        Course: {
          select: {
            title: true,
            code: true,
            color: true
          }
        },
        AnnouncementRead: {
          where: { userId: req.user.userId }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return announcements.map(announcement => ({
      ...announcement,
      isRead: announcement.AnnouncementRead.length > 0
    }));
  }

  @Post(':id/mark-read')
  async markAsRead(
    @Request() req: any,
    @Param('id') announcementId: string
  ) {
    await prisma.announcementRead.upsert({
      where: {
        userId_announcementId: {
          userId: req.user.userId,
          announcementId
        }
      },
      update: {},
      create: {
        userId: req.user.userId,
        announcementId
      }
    });

    return { ok: true, message: 'Marked as read' };
  }

  @Get()
  async getAllAnnouncements(@Request() req: any) {
    // Get all courses the user is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.userId },
      select: { courseId: true }
    });

    const courseIds = enrollments.map(e => e.courseId);

    const announcements = await prisma.announcement.findMany({
      where: {
        courseId: { in: courseIds }
      },
      include: {
        Course: {
          select: {
            title: true,
            code: true,
            color: true
          }
        },
        AnnouncementRead: {
          where: { userId: req.user.userId }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return announcements.map(announcement => ({
      ...announcement,
      isRead: announcement.AnnouncementRead.length > 0
    }));
  }
}
