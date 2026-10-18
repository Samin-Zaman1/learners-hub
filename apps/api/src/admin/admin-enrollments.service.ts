import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AdminEnrollmentsService {
  async getAllEnrollments() {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        User: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        Course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map(enrollment => ({
      ...enrollment,
      student: enrollment.User,
      course: enrollment.Course,
      status: enrollment.status || 'ACTIVE',
    }));
  }
}
