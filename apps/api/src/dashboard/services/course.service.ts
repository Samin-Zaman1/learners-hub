import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto, EnrollCourseDto, UpdateEnrollmentDto } from '../dto/course.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaClient) {}

  async createCourse(createCourseDto: CreateCourseDto) {
    // TODO: Fix this to work with new schema
    throw new Error('Course creation through dashboard service needs to be updated');
    /*
    return this.prisma.course.create({
      data: createCourseDto,
    });
    */
  }

  async findAllCourses() {
    return this.prisma.course.findMany({
      include: {
        Enrollment: {
          include: {
            User: {
              select: { id: true, email: true }
            }
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
  }

  async findCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        Enrollment: {
          include: {
            User: {
              select: { id: true, email: true }
            }
          }
        },
        Task: true,
        Announcement: true,
        Activity: true,
        ScheduleEvent: true,
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

    return course;
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }

  async enrollUserInCourse(userId: string, enrollCourseDto: EnrollCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: enrollCourseDto.courseId }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: enrollCourseDto.courseId
        }
      }
    });

    if (existingEnrollment) {
      throw new ForbiddenException('User is already enrolled in this course');
    }

    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId: enrollCourseDto.courseId,
      },
      include: {
        Course: true
      }
    });
  }

  async getUserEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        Course: {
          include: {
            _count: {
              select: {
                Task: true,
                Announcement: true
              }
            }
          }
        }
      }
    });
  }

  async updateEnrollment(userId: string, courseId: string, updateEnrollmentDto: UpdateEnrollmentDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: updateEnrollmentDto,
      include: {
        Course: true
      }
    });
  }

  async unenrollUserFromCourse(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });
  }
}
