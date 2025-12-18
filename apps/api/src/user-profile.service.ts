import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
}

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class UserProfileService {
  constructor(private prisma: PrismaClient) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        createdAt: true,
        verified: true,
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get role-specific stats
    let stats = {};
    
    if (user.role === 'STUDENT') {
      stats = await this.getStudentStats(userId);
    } else if (user.role === 'INSTRUCTOR') {
      stats = await this.getInstructorStats(userId);
    }

    return {
      ...user,
      stats
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    // If email is being changed, check if it's already taken
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        profileImage: data.profileImage,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        createdAt: true,
        verified: true,
      }
    });

    return updatedUser;
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    // Get user with password hash
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate new password
    if (data.newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    if (data.currentPassword === data.newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword }
    });

    return { message: 'Password changed successfully' };
  }

  private async getStudentStats(userId: string) {
    const [enrollmentCount, taskSubmissions, totalGrades] = await Promise.all([
      // Enrolled courses
      this.prisma.enrollment.count({
        where: {
          userId,
          status: 'ACTIVE'
        }
      }),
      
      // Task statistics
      this.prisma.taskSubmission.findMany({
        where: { studentId: userId },
        include: {
          Task: {
            select: {
              maxPoints: true
            }
          }
        }
      }),
      
      // Total activities
      this.prisma.activity.count({
        where: { userId }
      })
    ]);

    // Calculate grade statistics
    const gradedSubmissions = taskSubmissions.filter(s => s.status === 'GRADED' && s.points !== null);
    let averageGrade = 0;
    
    if (gradedSubmissions.length > 0) {
      const totalPoints = gradedSubmissions.reduce((sum, s) => sum + (s.Task.maxPoints || 0), 0);
      const earnedPoints = gradedSubmissions.reduce((sum, s) => sum + (s.points || 0), 0);
      averageGrade = totalPoints > 0 ? (earnedPoints / totalPoints * 100) : 0;
    }

    return {
      enrolledCourses: enrollmentCount,
      totalAssignments: taskSubmissions.length,
      completedAssignments: taskSubmissions.filter(s => s.status === 'COMPLETED' || s.status === 'GRADED').length,
      averageGrade: Math.round(averageGrade * 10) / 10,
      totalActivities: totalGrades
    };
  }

  private async getInstructorStats(userId: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!instructor) {
      return {};
    }

    const [courseCount, studentCount, taskCount, announcementCount] = await Promise.all([
      this.prisma.course.count({
        where: { instructorId: instructor.id }
      }),
      
      this.prisma.enrollment.count({
        where: { Course: {
            instructorId: instructor.id
          }
        }
      }),
      
      this.prisma.task.count({
        where: { Course: {
            instructorId: instructor.id
          }
        }
      }),
      
      this.prisma.announcement.count({
        where: { Course: {
            instructorId: instructor.id
          }
        }
      })
    ]);

    return {
      totalCourses: courseCount,
      totalStudents: studentCount,
      totalTasks: taskCount,
      totalAnnouncements: announcementCount
    };
  }
}

export type { UpdateProfileDto, ChangePasswordDto };
