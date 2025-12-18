import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { generateInvitationCode } from '../utils/code-generator';

export interface CreateCourseDto {
  title: string;
  code: string;
  description?: string;
  color?: string;
  credits?: number;
  semester: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  color?: string;
  credits?: number;
  semester?: string;
}

@Injectable()
export class InstructorCourseService {
  constructor(private prisma: PrismaClient) {}

  async createCourse(instructorId: string, createCourseDto: CreateCourseDto) {
    // Verify instructor role
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Only instructors can create courses');
    }

    // Check if course code is unique
    const existingCourse = await this.prisma.course.findUnique({
      where: { code: createCourseDto.code }
    });

    if (existingCourse) {
      throw new BadRequestException('Course code already exists');
    }

    return this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        code: createCourseDto.code,
        description: createCourseDto.description,
        color: createCourseDto.color,
        credits: createCourseDto.credits,
        semester: createCourseDto.semester,
        instructorId,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            Enrollment: true,
            Task: true,
            Announcement: true
          }
        }
      }
    });
  }

  async getInstructorCourses(instructorId: string) {
    // Verify instructor role
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Access denied');
    }

    // For now, get courses by instructor email
    return this.prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: {
            Enrollment: true,
            Task: true,
            Announcement: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  async getCourseById(courseId: string, instructorId: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        Enrollment: {
          include: {
            User: {
              select: {
                id: true,
                email: true
              }
            }
          }
        },
        Task: {
          orderBy: { dueDate: 'asc' }
        },
        Announcement: {
          orderBy: { createdAt: 'desc' }
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

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('Access denied to this course');
    }

    return course;
  }

  async updateCourse(courseId: string, instructorId: string, updateCourseDto: UpdateCourseDto) {
    // Verify course ownership
    await this.getCourseById(courseId, instructorId);

    return this.prisma.course.update({
      where: { id: courseId },
      data: updateCourseDto,
      include: {
        _count: {
          select: {
            Enrollment: true,
            Task: true,
            Announcement: true
          }
        }
      }
    });
  }

  async deleteCourse(courseId: string, instructorId: string) {
    // Verify course ownership
    await this.getCourseById(courseId, instructorId);

    return this.prisma.course.delete({
      where: { id: courseId }
    });
  }

  async inviteStudent(courseId: string, instructorId: string, studentEmail: string) {
    // Verify course ownership
    await this.getCourseById(courseId, instructorId);

    // Find student by email
    const student = await this.prisma.user.findUnique({
      where: { email: studentEmail }
    });

    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException('Student not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      throw new BadRequestException('Student is already enrolled in this course');
    }

    // Create enrollment directly for now
    return this.prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId
      },
      include: {
        User: {
          select: {
            id: true,
            email: true
          }
        },
        Course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      }
    });
  }



  async getInstructorStats(instructorId: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Access denied');
    }

    const [totalCourses, totalStudents, totalTasks, totalAnnouncements] = await Promise.all([
      this.prisma.course.count({
        where: { instructorId }
      }),
      this.prisma.enrollment.count({
        where: { Course: {
            instructorId
          }
        }
      }),
      this.prisma.task.count({
        where: { Course: {
            instructorId
          }
        }
      }),
      this.prisma.announcement.count({
        where: { Course: {
            instructorId
          }
        }
      })
    ]);

    return {
      totalCourses,
      totalStudents,
      activeAssignments: totalTasks, // Rename for frontend compatibility
      totalAnnouncements
    };
  }

  async generateInvitationCode(courseId: string, instructorId: string) {
    // Verify course belongs to instructor
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only generate codes for your own courses');
    }

    // Generate unique code
    let invitationCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      invitationCode = generateInvitationCode();
      const existing = await this.prisma.course.findUnique({
        where: { invitationCode }
      });
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new BadRequestException('Failed to generate unique invitation code');
    }

    // Update course with invitation code
    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
      data: { 
        invitationCode,
        status: 'ACTIVE', // Auto-publish when code is generated
        updatedAt: new Date()
      }
    });

    return {
      invitationCode: updatedCourse.invitationCode,
      courseId: updatedCourse.id,
      courseTitle: updatedCourse.title
    };
  }

  async getInvitationCode(courseId: string, instructorId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only view codes for your own courses');
    }

    if (!course.invitationCode) {
      throw new NotFoundException('No invitation code generated for this course');
    }

    return {
      invitationCode: course.invitationCode,
      courseId: course.id,
      courseTitle: course.title,
      status: course.status
    };
  }

  async getEnrolledStudents(courseId: string, instructorId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only view students for your own courses');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });

    return enrollments.map(enrollment => ({
      id: enrollment.id,
      student: enrollment.User,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status
    }));
  }

  async removeStudent(courseId: string, studentId: string, instructorId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only remove students from your own courses');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId,
        userId: studentId
      }
    });

    if (!enrollment) {
      throw new NotFoundException('Student not enrolled in this course');
    }

    await this.prisma.enrollment.delete({
      where: { id: enrollment.id }
    });

    return { message: 'Student removed successfully' };
  }

  async publishCourse(courseId: string, instructorId: string) {
    // Verify course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only publish your own courses');
    }

    if (course.status === 'ACTIVE') {
      throw new BadRequestException('Course is already published');
    }

    // Update course status to ACTIVE
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            Enrollment: true,
            Task: true,
            Announcement: true
          }
        }
      }
    });
  }

  async unpublishCourse(courseId: string, instructorId: string) {
    // Verify course ownership
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only unpublish your own courses');
    }

    if (course.status !== 'ACTIVE') {
      throw new BadRequestException('Course is not published');
    }

    // Update course status back to DRAFT
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'DRAFT',
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            Enrollment: true,
            Task: true,
            Announcement: true
          }
        }
      }
    });
  }
}
