import { StudentTaskService } from './student-task.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

// Builds a fake TaskSubmission row (as Prisma returns it with `include: { task }`).
// Defaults describe student1's own pending submission; pass overrides for what a test changes.
function makeSubmission(overrides = {}) {
  return {
    id: 'submission1',
    studentId: 'student1',
    status: 'PENDING',
    progress: 0,
    task: { id: 'task1', title: 'title1', courseId: 'course1' },
    ...overrides,
  };
}

describe('StudentTaskService', () => {
  let service: StudentTaskService;
  let fakePrisma: any;

  beforeEach(() => {
    fakePrisma = {
      enrollment: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { courseId: 'course1' },
            { courseId: 'course2' },
          ]),
      },
      taskSubmission: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
      },
      activity: {
        create: jest.fn(),
      },
    };
    service = new StudentTaskService(fakePrisma as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTaskSubmission', () => {
    it('throws NotFoundException when the task submission does not exist', async () => {
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(null);
      await expect(
        service.getTaskSubmission('student1', 'submission1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getTaskSubmission('student1', 'submission1'),
      ).rejects.toThrow('Task submission not found');
    });

    it('throws ForbiddenException when the task submission does not belong to the student', async () => {
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(
        makeSubmission({ studentId: 'student2' }), // Different student ID
      );
      await expect(
        service.getTaskSubmission('student1', 'submission1'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.getTaskSubmission('student1', 'submission1'),
      ).rejects.toThrow('You do not have access to this submission');
    });

    it('returns the submission when it belongs to the student', async () => {
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(
        makeSubmission()
      );
      const result = await service.getTaskSubmission('student1', 'submission1');
      expect(result).toMatchObject({
        id: 'submission1',
        status: 'PENDING',
        task: {
          id: 'task1',
          title: 'title1',
        },
      });
    });
  });

  describe('updateSubmission', () => {
    it('throws NotFoundException when the submission does not exist', async () => {
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(null);
      await expect(
        service.updateSubmission('student1', 'submission1', {
          status: 'IN_PROGRESS',
        }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateSubmission('student1', 'submission1', {
          status: 'IN_PROGRESS',
        }),
      ).rejects.toThrow('Submission not found');
    });
    it('throws ForbiddenException when the submission does not belong to the student', async () => {
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(
        makeSubmission({ studentId: 'student2' }) // Different student ID
      );
      await expect(
        service.updateSubmission('student1', 'submission1', {
          status: 'IN_PROGRESS',
        }),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateSubmission('student1', 'submission1', {
          status: 'IN_PROGRESS',
        }),
      ).rejects.toThrow('You do not have access to this submission');
    });
    it('throws BadRequest when progress is over 100', async () => {
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(
        makeSubmission()
      );
      await expect(
        service.updateSubmission('student1', 'submission1', { progress: 150 }),
      ).rejects.toThrow(BadRequestException);
    });
    it('throws BadRequest when progress is below 0', async () => {
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(
        makeSubmission()
      );
      await expect(
        service.updateSubmission('student1', 'submission1', { progress: -50 }),
      ).rejects.toThrow(BadRequestException);
    });
    it('sets progress to 100 and records submittedAt when status is COMPLETED', async () => {
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(
        makeSubmission()
      );
      fakePrisma.taskSubmission.update = jest
        .fn()
        .mockImplementation(({ data }) => {
          return {
            id: 'submission1',
            studentId: 'student1',
            taskId: 'task1',
            status: data.status,
            progress: data.progress,
            submittedAt: data.submittedAt,
            task: {
              id: 'task1',
              title: 'title1',
            },
          };
        });

      const result = await service.updateSubmission('student1', 'submission1', {
        status: 'COMPLETED',
      });

      expect(result.submission.progress).toBe(100);
      expect(result.submission.status).toBe('COMPLETED');
      expect(result.submission.submittedAt).toBeDefined();
    });
    it('returns the updated submission when it belongs to the student', async () => {
      // Arrange: fake 1, the submission exists and is Alice's
      fakePrisma.taskSubmission.findUnique.mockResolvedValue(
        makeSubmission()
      );

      // Arrange: fake 2, update echoes back what it was given
      fakePrisma.taskSubmission.update = jest
        .fn()
        .mockImplementation(({ data }) => {
          return {
            id: 'submission1',
            status: data.status,
            progress: data.progress,
          };
        });

      // Act
      const result = await service.updateSubmission('student1', 'submission1', {
        progress: 50,
      });

      // Assert
      expect(result.message).toBe('Submission updated');
    });
  }); // closes describe('updateSubmission')
}); // closes describe('StudentTaskService')
