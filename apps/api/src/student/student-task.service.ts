import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface UpdateSubmissionDto {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress?: number;
}

@Injectable()
export class StudentTaskService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all tasks assigned to student from all enrolled courses
   */
  async getAssignedTasks(studentId: string) {
    // Get all courses student is enrolled in
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: studentId },
      select: { courseId: true }
    });

    const courseIds = enrollments.map(e => e.courseId);

    // Get all task submissions for student across all enrolled courses
    const submissions = await this.prisma.taskSubmission.findMany({
      where: {
        studentId,
        task: {
          courseId: { in: courseIds }
        }
      },
      include: {
        task: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
                code: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: {
        task: {
          dueDate: 'asc'
        }
      }
    });

    return submissions.map(submission => ({
      id: submission.id,
      taskId: submission.task.id,
      title: submission.task.title,
      description: submission.task.description,
      type: submission.task.type,
      priority: submission.task.priority,
      dueDate: submission.task.dueDate,
      dueTime: submission.task.dueTime,
      maxPoints: submission.task.maxPoints,
      estimatedTime: submission.task.estimatedTime,
      course: submission.task.Course,
      // Submission details
      status: submission.status,
      points: submission.points,
      submittedAt: submission.submittedAt,
      feedback: submission.feedback,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt
    }));
  }

  /**
   * Get detailed information about a specific task submission
   */
  async getTaskSubmission(studentId: string, submissionId: string) {
    const submission = await this.prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
                code: true,
                color: true,
                instructor: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!submission) {
      throw new NotFoundException('Task submission not found');
    }

    if (submission.studentId !== studentId) {
      throw new ForbiddenException('You do not have access to this submission');
    }

    return {
      id: submission.id,
      task: {
        id: submission.task.id,
        title: submission.task.title,
        description: submission.task.description,
        type: submission.task.type,
        priority: submission.task.priority,
        dueDate: submission.task.dueDate,
        dueTime: submission.task.dueTime,
        maxPoints: submission.task.maxPoints,
        estimatedTime: submission.task.estimatedTime,
        createdAt: submission.task.createdAt,
        course: submission.task.Course,
        createdBy: submission.task.createdBy
      },
      status: submission.status,
      points: submission.points,
      submittedAt: submission.submittedAt,
      feedback: submission.feedback,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt
    };
  }

  /**
   * Update a task submission (student updates progress/status)
   */
  async updateSubmission(studentId: string, submissionId: string, updateData: UpdateSubmissionDto) {
    // Verify submission belongs to student
    const submission = await this.prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            courseId: true
          }
        }
      }
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.studentId !== studentId) {
      throw new ForbiddenException('You do not have access to this submission');
    }

    // Validate progress is between 0-100
    if (updateData.progress !== undefined && (updateData.progress < 0 || updateData.progress > 100)) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    // If marking as COMPLETED, set progress to 100 and record submission time
    const dataToUpdate: any = { ...updateData };
    if (updateData.status === 'COMPLETED') {
      dataToUpdate.progress = 100;
      dataToUpdate.submittedAt = new Date();
    }

    // Update the submission
    const updatedSubmission = await this.prisma.taskSubmission.update({
      where: { id: submissionId },
      data: dataToUpdate
    });

    // Create activity record
    await this.prisma.activity.create({
      data: {
        userId: studentId,
        courseId: submission.task.courseId,
        type: updateData.status === 'COMPLETED' ? 'SUBMISSION' : 'ASSIGNMENT',
        title: updateData.status === 'COMPLETED' ? `Submitted: ${submission.task.title}` : `Updated: ${submission.task.title}`,
        description: updateData.status === 'COMPLETED'
          ? `Completed and submitted task`
          : `Submission updated`,
        timestamp: new Date(),
        status: updateData.status || submission.status
      }
    });

    return {
      submission: updatedSubmission,
      message: updateData.status === 'COMPLETED' ? 'Task submitted successfully' : 'Submission updated'
    };
  }

  /**
   * Get task statistics for student
   */
  async getTaskStatistics(studentId: string) {
    // Get all submissions for student
    const submissions = await this.prisma.taskSubmission.findMany({
      where: { studentId },
      include: {
        task: {
          select: {
            dueDate: true,
            maxPoints: true
          }
        }
      }
    });

    const now = new Date();
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === 'PENDING').length;
    const inProgress = submissions.filter(s => s.status === 'IN_PROGRESS').length;
    const completed = submissions.filter(s => s.status === 'COMPLETED').length;
    const graded = submissions.filter(s => s.status === 'COMPLETED' && s.points !== null).length;
    
    // Calculate overdue tasks (PENDING or IN_PROGRESS and past due date)
    const overdue = submissions.filter(s => 
      (s.status === 'PENDING' || s.status === 'IN_PROGRESS') && 
      s.task.dueDate < now
    ).length;

    // Calculate average grade (only graded submissions with points)
    const gradedWithPoints = submissions.filter(s => s.status === 'COMPLETED' && s.points !== null);
    let averageGrade = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    if (gradedWithPoints.length > 0) {
      gradedWithPoints.forEach(s => {
        earnedPoints += s.points || 0;
        totalPoints += s.task.maxPoints || 0;
      });
      averageGrade = totalPoints > 0 ? (earnedPoints / totalPoints * 100) : 0;
    }

    return {
      totalTasks: total,
      pendingTasks: pending,
      inProgressTasks: inProgress,
      completedTasks: completed,
      gradedTasks: graded,
      overdueTasks: overdue,
      completionRate: total > 0 ? ((completed + graded) / total * 100) : 0,
      averageGrade: gradedWithPoints.length > 0 ? averageGrade : null
    };
  }

  /**
   * Get upcoming tasks (due within next 7 days)
   */
  async getUpcomingTasks(studentId: string, daysAhead: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: studentId },
      select: { courseId: true }
    });

    const courseIds = enrollments.map(e => e.courseId);

    const submissions = await this.prisma.taskSubmission.findMany({
      where: {
        studentId,
        OR: [
          { status: 'PENDING' },
          { status: 'IN_PROGRESS' },
          { status: 'COMPLETED', points: null }
        ],
        task: {
          courseId: { in: courseIds },
          dueDate: {
            gte: now,
            lte: futureDate
          }
        }
      },
      include: {
        task: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
                code: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: {
        task: {
          dueDate: 'asc'
        }
      },
      take: 10
    });

    return submissions.map(submission => ({
      id: submission.id,
      taskId: submission.task.id,
      title: submission.task.title,
      type: submission.task.type,
      priority: submission.task.priority,
      dueDate: submission.task.dueDate,
      dueTime: submission.task.dueTime,
      course: submission.task.Course,
      status: submission.status
    }));
  }
}
