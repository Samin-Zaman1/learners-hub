import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate: string; // ISO date string
  dueTime?: string;
  type: string; // assignment, quiz, exam, reading, project
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  maxPoints?: number;
  estimatedTime?: string;
}

export interface GradeSubmissionDto {
  points?: number;
  feedback?: string;
}

@Injectable()
export class InstructorTaskService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a task for a course
   * Automatically creates TaskSubmission for all enrolled students
   */
  async createTask(instructorId: string, courseId: string, createTaskDto: CreateTaskDto) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true
      }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    // Create the task
    const task = await this.prisma.task.create({
      data: {
        courseId,
        createdBy: instructorId,
        title: createTaskDto.title,
        description: createTaskDto.description,
        dueDate: new Date(createTaskDto.dueDate),
        dueTime: createTaskDto.dueTime,
        type: createTaskDto.type,
        priority: createTaskDto.priority || 'MEDIUM',
        maxPoints: createTaskDto.maxPoints,
        estimatedTime: createTaskDto.estimatedTime,
        updatedAt: new Date()
      }
    });

    // Get all enrolled students
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      select: { userId: true }
    });

    // Create TaskSubmission for each enrolled student
    const submissions = await Promise.all(
      enrollments.map(enrollment =>
        this.prisma.taskSubmission.create({
          data: {
            taskId: task.id,
            studentId: enrollment.userId,
            status: 'PENDING'
          }
        })
      )
    );

    return {
      task,
      submissionsCreated: submissions.length,
      message: `Task created and assigned to ${submissions.length} students`
    };
  }

  /**
   * Get all tasks for a course
   */
  async getCourseTasks(instructorId: string, courseId: string) {
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

    // Get all tasks with submission statistics
    const tasks = await this.prisma.task.findMany({
      where: { courseId },
      include: {
        submissions: {
          select: {
            status: true,
            points: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    // Calculate statistics for each task
    return tasks.map(task => {
      const totalSubmissions = task.submissions.length;
      const pendingCount = task.submissions.filter(s => s.status === 'PENDING').length;
      const inProgressCount = task.submissions.filter(s => s.status === 'IN_PROGRESS').length;
      const completedCount = task.submissions.filter(s => s.status === 'COMPLETED').length;
      const gradedCount = task.submissions.filter(s => s.status === 'COMPLETED' && s.points !== null).length;

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        maxPoints: task.maxPoints,
        estimatedTime: task.estimatedTime,
        createdAt: task.createdAt,
        statistics: {
          total: totalSubmissions,
          pending: pendingCount,
          inProgress: inProgressCount,
          completed: completedCount,
          graded: gradedCount,
          completionRate: totalSubmissions > 0 ? ((completedCount + gradedCount) / totalSubmissions * 100).toFixed(1) : '0'
        }
      };
    });
  }

  /**
   * Get a specific task with details
   */
  async getTaskById(instructorId: string, courseId: string, taskId: string) {
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

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
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

    if (!task || task.courseId !== courseId) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  /**
   * Get all submissions for a task
   */
  async getTaskSubmissions(instructorId: string, courseId: string, taskId: string) {
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

    // Verify task belongs to course
    const task = await this.prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task || task.courseId !== courseId) {
      throw new NotFoundException('Task not found');
    }

    // Get all submissions with student info
    const submissions = await this.prisma.taskSubmission.findMany({
      where: { taskId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    return submissions.map(submission => ({
      id: submission.id,
      student: {
        id: submission.student.id,
        email: submission.student.email,
        name: submission.student.firstName && submission.student.lastName
          ? `${submission.student.firstName} ${submission.student.lastName}`
          : submission.student.email
      },
      status: submission.status,
      points: submission.points,
      submittedAt: submission.submittedAt,
      feedback: submission.feedback,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt
    }));
  }

  /**
   * Grade a student's submission
   */
  async gradeSubmission(
    instructorId: string,
    courseId: string,
    taskId: string,
    submissionId: string,
    gradeData: GradeSubmissionDto
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

    // Verify task belongs to course
    const task = await this.prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task || task.courseId !== courseId) {
      throw new NotFoundException('Task not found');
    }

    // Verify submission exists and belongs to task
    const submission = await this.prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!submission || submission.taskId !== taskId) {
      throw new NotFoundException('Submission not found');
    }

    // Validate points don't exceed maxPoints
    if (gradeData.points !== undefined && task.maxPoints !== null) {
      if (gradeData.points > task.maxPoints) {
        throw new BadRequestException(`Points (${gradeData.points}) cannot exceed max points (${task.maxPoints})`);
      }
    }

    // Update submission with grade
    const updatedSubmission = await this.prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        points: gradeData.points,
        feedback: gradeData.feedback,
        status: 'GRADED',
        gradedBy: instructorId,
        gradedAt: new Date()
      }
    });

    // Create activity record for the student
    await this.prisma.activity.create({
      data: {
        userId: submission.student.id,
        courseId: courseId,
        type: 'GRADE',
        title: `Graded: ${task.title}`,
        description: `Received ${gradeData.points} points`,
        timestamp: new Date(),
        status: 'COMPLETED'
      }
    });

    return {
      submission: updatedSubmission,
      message: 'Submission graded successfully'
    };
  }

  /**
   * Update a task
   */
  async updateTask(
    instructorId: string,
    courseId: string,
    taskId: string,
    updateData: Partial<CreateTaskDto>
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

    // Verify task belongs to course
    const task = await this.prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task || task.courseId !== courseId) {
      throw new NotFoundException('Task not found');
    }

    // Update task
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined
      }
    });

    return updatedTask;
  }

  /**
   * Delete a task and all its submissions
   */
  async deleteTask(instructorId: string, courseId: string, taskId: string) {
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

    // Verify task belongs to course
    const task = await this.prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task || task.courseId !== courseId) {
      throw new NotFoundException('Task not found');
    }

    // Delete task (cascade will delete submissions)
    await this.prisma.task.delete({
      where: { id: taskId }
    });

    return {
      message: 'Task deleted successfully'
    };
  }

  /**
   * Get all submissions across all tasks in a course for grading interface
   */
  async getAllCourseSubmissions(instructorId: string, courseId: string, filters?: {
    taskId?: string;
    status?: string;
    studentId?: string;
  }) {
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

    // Build where clause
    const where: any = {
      task: {
        courseId
      }
    };

    if (filters?.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }

    // Get submissions
    const submissions = await this.prisma.taskSubmission.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            type: true,
            maxPoints: true,
            dueDate: true
          }
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { task: { dueDate: 'desc' } },
        { student: { lastName: 'asc' } }
      ]
    });

    return submissions;
  }

  /**
   * Bulk grade multiple submissions
   */
  async bulkGradeSubmissions(
    instructorId: string,
    courseId: string,
    taskId: string,
    grades: Array<{ submissionId: string; points?: number; feedback?: string }>
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

    // Verify task belongs to course
    const task = await this.prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task || task.courseId !== courseId) {
      throw new NotFoundException('Task not found');
    }

    // Update all submissions
    const results = await Promise.all(
      grades.map(grade =>
        this.prisma.taskSubmission.update({
          where: { id: grade.submissionId },
          data: {
            points: grade.points,
            feedback: grade.feedback,
            status: 'GRADED' as any,
            updatedAt: new Date()
          }
        })
      )
    );

    return {
      graded: results.length,
      message: `Successfully graded ${results.length} submissions`
    };
  }

  /**
   * Create multiple tasks at once (bulk creation)
   */
  async bulkCreateTasks(
    instructorId: string,
    courseId: string,
    tasks: CreateTaskDto[]
  ) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        Enrollment: {
          select: { userId: true }
        }
      }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    const createdTasks: any[] = [];

    // Create each task
    for (const taskDto of tasks) {
      const task = await this.prisma.task.create({
        data: {
          courseId,
          createdBy: instructorId,
          title: taskDto.title,
          description: taskDto.description,
          dueDate: new Date(taskDto.dueDate),
          dueTime: taskDto.dueTime,
          type: taskDto.type,
          priority: taskDto.priority || 'MEDIUM',
          maxPoints: taskDto.maxPoints,
          estimatedTime: taskDto.estimatedTime,
          updatedAt: new Date()
        }
      });

      // Create submissions for all enrolled students
      await Promise.all(
        course.Enrollment.map(enrollment =>
          this.prisma.taskSubmission.create({
            data: {
              taskId: task.id,
              studentId: enrollment.userId,
              status: 'PENDING'
            }
          })
        )
      );

      createdTasks.push(task);
    }

    return {
      created: createdTasks.length,
      tasks: createdTasks,
      message: `Successfully created ${createdTasks.length} tasks`
    };
  }

  /**
   * Duplicate an existing task
   */
  async duplicateTask(
    instructorId: string,
    courseId: string,
    taskId: string,
    newDueDate?: string
  ) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        Enrollment: {
          select: { userId: true }
        }
      }
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    // Get original task
    const originalTask = await this.prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!originalTask || originalTask.courseId !== courseId) {
      throw new NotFoundException('Task not found');
    }

    // Create duplicate
    const duplicatedTask = await this.prisma.task.create({
      data: {
        courseId,
        createdBy: instructorId,
        title: `${originalTask.title} (Copy)`,
        description: originalTask.description,
        dueDate: newDueDate ? new Date(newDueDate) : originalTask.dueDate,
        dueTime: originalTask.dueTime,
        type: originalTask.type,
        priority: originalTask.priority,
        maxPoints: originalTask.maxPoints,
        estimatedTime: originalTask.estimatedTime,
        updatedAt: new Date()
      }
    });

    // Create submissions for all enrolled students
    const submissions = await Promise.all(
      course.Enrollment.map(enrollment =>
        this.prisma.taskSubmission.create({
          data: {
            taskId: duplicatedTask.id,
            studentId: enrollment.userId,
            status: 'PENDING'
          }
        })
      )
    );

    return {
      task: duplicatedTask,
      submissionsCreated: submissions.length,
      message: 'Task duplicated successfully'
    };
  }
}
