import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { isValidInvitationCode } from '../utils/code-generator';

@Injectable()
export class StudentCourseService {
  constructor(private prisma: PrismaClient) {}

  async getEnrolledCourses(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { 
        userId: studentId,
        status: 'ACTIVE',
        Course: {
          status: 'ACTIVE' as any // Only show courses that are published to students
        }
      },
      include: {
        Course: {
          include: {
            instructor: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            },
            _count: {
              select: {
                Enrollment: true,
                Task: true,
                Announcement: true,
                CourseMaterial: true
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });

    return enrollments.map(enrollment => ({
      ...enrollment.Course,
      enrolledAt: enrollment.enrolledAt,
      enrollmentStatus: enrollment.status
    }));
  }

  async previewCourseByCode(code: string) {
    // Validate code format
    if (!isValidInvitationCode(code)) {
      throw new BadRequestException('Invalid invitation code format');
    }

    const course = await this.prisma.course.findUnique({
      where: { invitationCode: code },
      include: {
        instructor: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            Enrollment: true,
            CourseMaterial: true
          }
        }
      }
    });

    if (!course) {
      throw new NotFoundException('Course not found with this invitation code');
    }

    if (course.status !== 'ACTIVE') {
      throw new BadRequestException('This course is not published yet');
    }

    // Return limited info for preview
    return {
      id: course.id,
      title: course.title,
      code: course.code,
      description: course.description,
      instructor: course.instructor?.email || 'Unknown',
      color: course.color,
      credits: course.credits,
      semester: course.semester,
      level: course.level,
      enrollmentCount: course._count.Enrollment,
      materialCount: course._count.CourseMaterial
    };
  }

  async enrollWithCode(studentId: string, code: string) {
    // Validate code format
    if (!isValidInvitationCode(code)) {
      throw new BadRequestException('Invalid invitation code format');
    }

    // Find course by code
    const course = await this.prisma.course.findUnique({
      where: { code: code },
      include: {
        _count: {
          select: {
            Enrollment: true
          }
        }
      }
    });

    if (!course) {
      throw new NotFoundException('Course not found with this code');
    }

    // Check if course is published
    if (course.status !== 'ACTIVE') {
      throw new BadRequestException('This course is not published yet');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: studentId,
        courseId: course.id
      }
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'ACTIVE') {
        throw new BadRequestException('You are already enrolled in this course');
      } else {
        // Re-activate if previously dropped
        await this.prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { 
            status: 'ACTIVE',
            enrolledAt: new Date()
          }
        });
        return { message: 'Re-enrolled successfully', courseId: course.id };
      }
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: studentId,
        courseId: course.id,
        status: 'ACTIVE'
      },
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

    return {
      message: 'Enrolled successfully',
      enrollment: {
        id: enrollment.id,
        course: enrollment.Course,
        enrolledAt: enrollment.enrolledAt
      }
    };
  }

  async unenrollFromCourse(studentId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: studentId,
        courseId,
        status: 'ACTIVE'
      }
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    // Update status to DROPPED instead of deleting
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'DROPPED' }
    });

    return { message: 'Unenrolled successfully' };
  }

  async getCourseDetails(studentId: string, courseId: string) {
    // Verify enrollment
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: studentId,
        courseId,
        status: 'ACTIVE'
      }
    });

    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled to view course details');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        CourseModule: {
          include: {
            CourseMaterial: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        CourseMaterial: {
          where: {
            moduleId: null // Top-level materials
          }
        },
        _count: {
          select: {
            Enrollment: true,
            Task: true,
            Announcement: true
          }
        }
      }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      ...course,
      enrolledAt: enrollment.enrolledAt,
      enrollmentStatus: enrollment.status
    };
  }
}
