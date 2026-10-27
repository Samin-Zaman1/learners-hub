import {
  StudentTaskService,
  UpdateSubmissionDto,
} from './student-task.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('StudentTaskService', () => {
  let service: StudentTaskService;
  let fakePrisma: any; // `any` so it doesn't need to be a full PrismaClient

  // Runs before every test: builds a fresh fake database and a new service,
  // so one test's fake answers never leak into the next test.
  beforeEach(() => {
    // Only the tables/methods the service calls. jest.fn() returns nothing until told to.
    fakePrisma = {
      enrollment: {
        findMany: jest.fn(),
      },
      taskSubmission: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      activity: {
        create: jest.fn(),
      },
    };
    // Dependency injection: the service gets the fake instead of a real PrismaClient
    service = new StudentTaskService(fakePrisma);
  });

  describe('getAssignedTasks', () => {
    // Happy path: checks the ANSWER. Each submission from the database is
    // reshaped into a flat object (task.id -> taskId, task.Course -> course).
    it('should return student enrollments tasks for a student', async () => {
      // Arrange: the student is in one course, and that course has one submission
      const studentId = 'student-1';
      // mockResolvedValue = what the fake hands back when the service awaits it
      fakePrisma.enrollment.findMany.mockResolvedValue([
        { courseId: 'course-1' },
      ]);
      fakePrisma.taskSubmission.findMany.mockResolvedValue([
        {
          id: 'submission-1',
          status: 'PENDING',
          task: {
            id: 'task-1',
            title: 'Task 1',
            Course: {
              id: 'course-1',
              title: 'Course 1',
              code: 'COURSE-1',
              color: 'blue',
            },
          },
        },
      ]);

      // Act
      const result = await service.getAssignedTasks(studentId);

      // Assert: one submission in, one reshaped task out
      expect(result).toHaveLength(1);
      // toMatchObject: must contain these fields; extra fields are fine
      expect(result[0]).toMatchObject({
        id: 'submission-1',
        taskId: 'task-1',
        title: 'Task 1',
        status: 'PENDING',
        course: {
          id: 'course-1',
          title: 'Course 1',
          code: 'COURSE-1',
          color: 'blue',
        },
      });
    });

    // Checks the QUESTION: the course IDs from the enrollments must be passed
    // into the submissions query. Catches bugs the happy-path test can't,
    // because a fake returns the same answer no matter what it is asked.
    it('queries submissions for the enrolled course IDs', async () => {
      // Arrange: two enrollments; the submissions answer doesn't matter here
      const studentId = 'student-1';
      const courseIds = ['course-1', 'course-2'];
      fakePrisma.enrollment.findMany.mockResolvedValue([
        { courseId: 'course-1' },
        { courseId: 'course-2' },
      ]);
      fakePrisma.taskSubmission.findMany.mockResolvedValue([]); // still needed, or .map crashes

      // Act
      await service.getAssignedTasks(studentId);

      // Assert: the second database call asked for this student's tasks in both courses
      // objectContaining ignores the parts we don't care about (e.g. `include`)
      expect(fakePrisma.taskSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            studentId,
            task: {
              courseId: { in: courseIds },
            },
          }),
        }),
      );
    });

    // Edge case: a student with no enrollments gets an empty list, not a crash
    it('returns an empty list when the student is not enrolled in any courses', async () => {
      // Arrange: no enrollments
      const studentId = 'student-2';
      fakePrisma.enrollment.findMany.mockResolvedValue([]);
      fakePrisma.taskSubmission.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getAssignedTasks(studentId);

      // Assert
      expect(result).toEqual([]);
      expect(fakePrisma.taskSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            studentId,
            task: {
              courseId: { in: [] },
            },
          }),
        }),
      );
    });
  });

  describe('getTaskSubmission', () => {
    it('Should throw NotFoundException if submission does not exist', async () => {
      // Arrange: Prisma's findUnique returns null when nothing matches
      const studentId = 'student-1';
      const submissionId = 'submission-1';
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(null);

      // Act + Assert: pass the Promise to expect() (no await inside); .rejects checks it fails
      await expect(
        service.getTaskSubmission(studentId, submissionId),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw ForbiddenException if submission does not belong to student', async () => {
      const studentId = 'student-1';
      const submissionId = 'submission-1';
      fakePrisma.taskSubmission.findUnique.mockResolvedValue({
        id: submissionId,
        studentId: 'student-2', // different student
      });

      await expect(
        service.getTaskSubmission(studentId, submissionId),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should return submission details if submission exists and belongs to student', async () => {
      const studentId = 'student-1';
      const submissionId = 'submission-1';
      const mockSubmission = {
        id: submissionId,
        studentId: studentId,
        status: 'PENDING',
        points: 10,
        task: {
          title: 'Task 1',
          description: 'Task description',
          type: 'ASSIGNMENT',
          priority: 'HIGH',
          dueDate: new Date(),
          dueTime: '12:00',
          maxPoints: 100,
          estimatedTime: 60,
          createdAt: new Date(),
          Course: {
            id: 'course-1',
            title: 'Course 1',
            code: 'COURSE-1',
            color: 'blue',
          },
          createdBy: {
            id: 'teacher-1',
            name: 'Teacher 1',
            email: 'samin@gmail.com',
          },
        },
        submittedAt: new Date(),
        feedback: 'Good job!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(mockSubmission);
      const result = await service.getTaskSubmission(studentId, submissionId);
      // Expected values written by hand, not copied from mockSubmission,
      // so a typo in the service can't be repeated here and slip through
      expect(result).toMatchObject({
        id: 'submission-1',
        task: {
          title: 'Task 1',
          description: 'Task description',
          type: 'ASSIGNMENT',
          priority: 'HIGH',
          dueDate: expect.any(Date), // any Date is fine; the exact time doesn't matter
          dueTime: '12:00',
          maxPoints: 100,
          estimatedTime: 60,
          // renamed by the service: Course -> course
          course: {
            id: 'course-1',
            title: 'Course 1',
            code: 'COURSE-1',
            color: 'blue',
          },
          createdBy: {
            id: 'teacher-1',
            name: 'Teacher 1',
            email: 'samin@gmail.com',
          },
        },
        status: 'PENDING',
        points: 10,
        submittedAt: expect.any(Date),
        feedback: 'Good job!',
      });
    });
    it('check that the right submission was looked up in the database', async () => {
      const studentId = 'student-1';
      const submissionId = 'submission-1';
      fakePrisma.taskSubmission.findUnique.mockResolvedValue({
        id: submissionId,
        studentId: studentId,
        task: {},
      });
      await service.getTaskSubmission(studentId, submissionId);
      expect(fakePrisma.taskSubmission.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: submissionId,
          },
        }),
      );
    });
  });
  describe('updateSubmission', () => {
    it('should throw not found exception if submission does not exist', async () => {
      const studentId = 'student-1';
      const submissionId = 'submission-1';
      const updateData: UpdateSubmissionDto = { status: 'COMPLETED' };
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(null);
      await expect(
        service.updateSubmission(studentId, submissionId, updateData),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw forbidden exception if submission does not belong to student', async () => {
      const studentId = 'student-1';
      const submissionId = 'submission-1';
      const updateData: UpdateSubmissionDto = { status: 'COMPLETED' };
      fakePrisma.taskSubmission.findUnique.mockResolvedValue({
        id: submissionId,
        studentId: 'student-2', // different student
      });
      await expect(
        service.updateSubmission(studentId, submissionId, updateData),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should throw bad request exception if progress is out of range', async () => {
      const studentId = 'student-1';
      const submissionId = 'submission-1';
      const updateData: UpdateSubmissionDto = { progress: 150 }; // Invalid progress
      fakePrisma.taskSubmission.findUnique.mockResolvedValue({
        id: submissionId,
        studentId: studentId,
      });
      await expect(
        service.updateSubmission(studentId, submissionId, updateData),
      ).rejects.toThrow(BadRequestException);
    });
    it('should be marked as completed', async () => {
      const studentId = 'student-1';
      const submissionId = 'submission-1';
      const updateData: UpdateSubmissionDto = { status: 'COMPLETED' };
      const mockTask = {
        id: submissionId,
        courseId: 'course-1',
        title: 'Task 1',
      };
      fakePrisma.taskSubmission.findUnique.mockResolvedValue({
        id: submissionId,
        studentId: studentId,
        task: mockTask,
      });
      fakePrisma.taskSubmission.update.mockResolvedValue({
        status: 'COMPLETED',
      });
      const result = await service.updateSubmission(
        studentId,
        submissionId,
        updateData,
      );
      expect(result).toMatchObject({
        submission: {
          status: 'COMPLETED',
        },
        message: 'Task submitted successfully',
      });
      expect(fakePrisma.taskSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            submittedAt: expect.any(Date),
            progress: 100,
          }),
        }),
      );
    });
    it('should be a normal update if submission exists and belongs to student', async () => {
      const studentId = 'student-1';
      const submissionId = 'submission-1';
      const updateData: UpdateSubmissionDto = { progress: 50 };
      const mockTask = {
        id: submissionId,
        courseId: 'course-1',
        title: 'Task 1',
      };
      fakePrisma.taskSubmission.findUnique.mockResolvedValue({
        id: submissionId,
        studentId: studentId,
        task: mockTask,
      });
      fakePrisma.taskSubmission.update.mockResolvedValue({
        status: 'IN_PROGRESS',
        progress: 50,
      });
      const result = await service.updateSubmission(
        studentId,
        submissionId,
        updateData,
      );
      expect(result).toMatchObject({
        submission: {
          status: 'IN_PROGRESS',
          progress: 50,
        },
        message: 'Submission updated',
      });
    });
  });
  describe('getTaskStatistics', () => {
    it('should return task statistics for a student', async () => {
      fakePrisma.taskSubmission.findMany.mockResolvedValue([]);
      const result = await service.getTaskStatistics('student-1');
      expect(result).toEqual({
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        gradedTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        averageGrade: null,
      });
    });
  });
});
