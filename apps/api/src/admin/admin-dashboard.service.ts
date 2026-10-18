import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AdminDashboardService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      // Get total users count
      const totalUsers = await prisma.user.count();

      // Get user breakdown by role
      const studentCount = await prisma.user.count({
        where: { role: 'STUDENT' },
      });

      const instructorCount = await prisma.user.count({
        where: { role: 'INSTRUCTOR' },
      });

      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      // Get total courses
      const totalCourses = await prisma.course.count();

      // Get course breakdown by status
      const activeCourses = await prisma.course.count({
        where: { status: 'ACTIVE' as any },
      });

      const draftCourses = await prisma.course.count({
        where: { status: 'DRAFT' as any },
      });

      const completedCourses = await prisma.course.count({
        where: { status: 'COMPLETED' as any },
      });

      // Get active enrollments
      const activeEnrollments = await prisma.enrollment.count({
        where: { status: 'ACTIVE' as any },
      });

      // Get total enrollments
      const totalEnrollments = await prisma.enrollment.count();

      // Calculate system activity (example: percentage of active enrollments)
      const systemActivity =
        totalEnrollments > 0
          ? `${Math.round((activeEnrollments / totalEnrollments) * 100)}%`
          : '0%';

      return {
        totalUsers,
        studentCount,
        instructorCount,
        adminCount,
        totalCourses,
        activeCourses,
        draftCourses,
        completedCourses,
        activeEnrollments,
        totalEnrollments,
        systemActivity,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity() {
    try {
      // Get recent enrollments
      const recentEnrollments = await prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        include: {
          User: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          Course: {
            select: {
              title: true,
            },
          },
        },
      });

      // Get recently created courses
      const recentCourses = await prisma.course.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Get recently created users
      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      // Format activity feed
      const activities: any[] = [];

      // Add enrollment activities
      recentEnrollments.forEach((enrollment) => {
        const userName = enrollment.User.firstName
          ? `${enrollment.User.firstName} ${enrollment.User.lastName || ''}`
          : enrollment.User.email;
        activities.push({
          id: `enroll-${enrollment.id}`,
          type: 'enrollment',
          user: userName,
          action:
            enrollment.status === 'COMPLETED'
              ? 'completed'
              : enrollment.status === 'DROPPED'
              ? 'dropped'
              : 'enrolled in',
          target: enrollment.Course.title,
          time: this.getTimeAgo(enrollment.enrolledAt),
          timestamp: enrollment.enrolledAt,
        });
      });

      // Add course creation activities
      recentCourses.forEach((course) => {
        const instructorName = course.instructor.firstName
          ? `${course.instructor.firstName} ${course.instructor.lastName || ''}`
          : course.instructor.email;
        activities.push({
          id: `course-${course.id}`,
          type: 'course',
          user: instructorName,
          action: 'created',
          target: course.title,
          time: this.getTimeAgo(course.createdAt),
          timestamp: course.createdAt,
        });
      });

      // Add user creation activities
      recentUsers.forEach((user) => {
        const userName = user.firstName
          ? `${user.firstName} ${user.lastName || ''}`
          : user.email;
        activities.push({
          id: `user-${user.email}`,
          type: 'user',
          user: 'Admin',
          action: 'added new',
          target: `${user.role.toLowerCase()} account (${userName})`,
          time: this.getTimeAgo(user.createdAt),
          timestamp: user.createdAt,
        });
      });

      // Sort by timestamp and return top 10
      activities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return activities.slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  /**
   * Helper function to calculate time ago
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}
