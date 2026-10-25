import { StudentTaskService } from './student-task.service';

describe('StudentTaskService', () => {
  let service: StudentTaskService;
  let fakePrisma: any;

  // Runs before every test: builds a fresh fake database and a new service,
  // so one test's fake answers never leak into the next test.
  beforeEach(() => {
    fakePrisma = {
      enrollment: {
        findMany: jest.fn(),
      },
      taskSubmission: {
        findMany: jest.fn(),
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
      fakePrisma.taskSubmission.findMany.mockResolvedValue([]);

      // Act
      await service.getAssignedTasks(studentId);

      // Assert: the second database call asked for this student's tasks in both courses
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
});
