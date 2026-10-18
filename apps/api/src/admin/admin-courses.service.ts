import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AdminCoursesService {
  async getAllCourses(query: any) {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            Enrollment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data to include enrollment count
    return courses.map(course => ({
      ...course,
      enrollmentCount: course._count.Enrollment,
      status: course.status || 'DRAFT',
    }));
  }

  async getCourseById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            Enrollment: true,
          },
        },
      },
    });
  }

  async createCourse(courseData: any) {
    const { title, code, description, credits, instructorId, status } = courseData;

    const course = await prisma.course.create({
      data: {
        title,
        code,
        description,
        credits: credits || 3,
        instructorId,
        status: status || 'DRAFT',
        semester: 'Fall 2026',
        updatedAt: new Date(),
      },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            Enrollment: true,
          },
        },
      },
    });

    return {
      ...course,
      enrollmentCount: course._count.Enrollment,
    };
  }

  async updateCourse(id: string, courseData: any) {
    const { title, code, description, credits, instructorId, status } = courseData;

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        code,
        description,
        credits,
        instructorId,
        status,
      },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            Enrollment: true,
          },
        },
      },
    });

    return {
      ...course,
      enrollmentCount: course._count.Enrollment,
    };
  }

  async publishToInstructor(id: string) {
    // Verify course exists and is in DRAFT status
    const course = await prisma.course.findUnique({
      where: { id },
      select: { status: true, instructorId: true, title: true },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.status !== 'DRAFT') {
      throw new Error('Only DRAFT courses can be published to instructors');
    }

    if (!course.instructorId) {
      throw new Error('Course must have an assigned instructor before publishing');
    }

    // Update status to ASSIGNED
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { 
        status: 'ASSIGNED' as any,
        updatedAt: new Date(),
      },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      ...updatedCourse,
      message: `Course "${course.title}" published to instructor`,
    };
  }

  async deleteCourse(id: string) {
    await prisma.course.delete({ where: { id } });
    return { message: 'Course deleted successfully' };
  }
}
