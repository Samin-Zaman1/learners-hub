import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class StudentSemesterService {
  /**
   * Get all semesters with enrolled courses for a student
   */
  async getSemesters(studentId: string) {
    try {
      // Get all enrollments for the student
      const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      include: {
        Course: {
          include: {
            instructor: true,
          },
        },
      },
    });

    // Group courses by semester
    const semesterMap = new Map<string, any>();

    for (const enrollment of enrollments) {
      const course = enrollment.Course;
      const semester = course.semester || 'Unassigned';
      
      if (!semesterMap.has(semester)) {
        semesterMap.set(semester, {
          semester,
          enrollments: [],
          totalCredits: 0,
          completedCredits: 0,
        });
      }

      const semesterData = semesterMap.get(semester);
      semesterData.enrollments.push({
        enrollmentId: enrollment.id,
        course: course,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
      });
      
      semesterData.totalCredits += course.credits || 0;
      
      // Calculate completed credits (if status is COMPLETED)
      if (enrollment.status === 'COMPLETED') {
        semesterData.completedCredits += course.credits || 0;
      }
    }

    // Convert map to array and sort by semester
    const semesters = Array.from(semesterMap.values()).sort((a, b) => {
      // Simple sorting logic - you may want to customize this
      if (a.semester < b.semester) return -1;
      if (a.semester > b.semester) return 1;
      return 0;
    });

    return semesters;
    } catch (error) {
      console.error('Error in getSemesters:', error);
      return [];
    }
  }

  /**
   * Get courses enrolled in a specific semester
   */
  async getCoursesBySemester(studentId: string, semester: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: studentId,
        Course: {
          semester,
        },
      },
      include: {
        Course: {
          include: {
            instructor: true,
            _count: {
              select: {
                Enrollment: true,
              },
            },
          },
        },
      },
    });

    return enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      courseId: enrollment.Course.id,
      title: enrollment.Course.title,
      code: enrollment.Course.code,
      instructor: enrollment.Course.instructor?.email || 'Unknown',
      credits: enrollment.Course.credits,
      enrolledStudents: enrollment.Course._count.Enrollment,
      status: enrollment.status,
      color: enrollment.Course.color,
      semester: enrollment.Course.semester,
      enrolledAt: enrollment.enrolledAt,
    }));
  }

  /**
   * Get available courses (published courses not yet enrolled)
   */
  async getAvailableCourses(studentId: string) {
    // Get courses the student is already enrolled in
    const enrolledCourses = await prisma.enrollment.findMany({
      where: { userId: studentId },
      select: { courseId: true },
    });

    const enrolledCourseIds = enrolledCourses.map((e) => e.courseId);

    // Get published courses not enrolled by the student
    const availableCourses = await prisma.course.findMany({
      where: {
        status: 'ACTIVE',
        id: {
          notIn: enrolledCourseIds,
        },
      },
      include: {
        instructor: true,
        _count: {
          select: {
            Enrollment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 courses
    });

    return availableCourses.map((course) => ({
      id: course.id,
      title: course.title,
      code: course.code,
      instructor: course.instructor?.email || 'Unknown',
      credits: course.credits,
      enrolledStudents: course._count.Enrollment,
      color: course.color,
      semester: course.semester,
      description: course.description,
    }));
  }

  /**
   * Get semester statistics for the current/active semester
   */
  async getSemesterStatistics(studentId: string) {
    try {
      // Get user profile
      const user = await prisma.user.findUnique({
        where: { id: studentId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      // Get all enrollments
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: studentId },
        include: {
          Course: {
            include: {
              instructor: true,
            },
          },
        },
      });

      // If no enrollments, return default stats
      if (enrollments.length === 0) {
        return {
          user,
          currentSemester: 'Session 2025',
          completionRate: 0,
          totalEnrolledCourses: 0,
          completedCourses: 0,
          assignments: {
            submitted: 0,
            total: 0,
          },
          quizzes: {
            attended: 0,
            total: 0,
          },
          faculties: [],
        };
      }

      // Determine current semester (you may want to add logic to identify "current" semester)
      // For now, we'll use the most recent semester
      const currentSemester = enrollments[0].Course.semester || 'Session 2025';

    // Filter enrollments for current semester
    const currentSemesterEnrollments = enrollments.filter(
      (e) => e.Course.semester === currentSemester
    );

    const totalEnrolledCourses = currentSemesterEnrollments.length;
    const completedCourses = currentSemesterEnrollments.filter(
      (e) => e.status === 'COMPLETED'
    ).length;

    // Get tasks/assignments for current semester courses
    const courseIds = currentSemesterEnrollments.map((e) => e.courseId);

    const allTasks = await prisma.task.findMany({
      where: {
        courseId: { in: courseIds },
      },
      select: {
        id: true,
        type: true,
      },
    });

    const assignments = allTasks.filter((t) => t.type === 'ASSIGNMENT');
    const quizzes = allTasks.filter((t) => t.type === 'QUIZ');

    // Get submissions
    const submissions = await prisma.taskSubmission.findMany({
      where: {
        studentId,
        taskId: { in: allTasks.map(t => t.id) },
      },
      include: {
        Task: true,
      },
    });

    const assignmentSubmissions = submissions.filter(
      (s) => s.Task.type === 'assignment' || s.Task.type === 'ASSIGNMENT'
    );
    const quizSubmissions = submissions.filter(
      (s) => s.Task.type === 'quiz' || s.Task.type === 'QUIZ'
    );

    // Calculate completion rate
    const totalCredits = currentSemesterEnrollments.reduce(
      (sum, e) => sum + (e.Course.credits || 0),
      0
    );
    const completedCredits = currentSemesterEnrollments
      .filter((e) => e.status === 'COMPLETED')
      .reduce((sum, e) => sum + (e.Course.credits || 0), 0);

    const completionRate = totalCredits > 0 
      ? Math.round((completedCredits / totalCredits) * 100) 
      : 0;

    // Get unique faculties from current semester courses
    const facultyMap = new Map();
    for (const enrollment of currentSemesterEnrollments) {
      const course = enrollment.Course;
      if (course.instructor && !facultyMap.has(course.instructor.id)) {
        facultyMap.set(course.instructor.id, {
          id: course.instructor.id,
          name: `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || course.instructor.email,
          email: course.instructor.email,
          department: 'Computer Science & Engineering', // You may want to add this to the schema
          university: 'Jahangirnagar University', // You may want to add this to the schema
        });
      }
    }

    const faculties = Array.from(facultyMap.values());

    return {
      user,
      currentSemester,
      completionRate,
      totalEnrolledCourses,
      completedCourses,
      assignments: {
        submitted: assignmentSubmissions.length,
        total: assignments.length,
      },
      quizzes: {
        attended: quizSubmissions.length,
        total: quizzes.length,
      },
      faculties,
    };
    } catch (error) {
      console.error('Error in getSemesterStatistics:', error);
      throw error;
    }
  }

  /**
   * Get upcoming tasks for the student
   */
  async getUpcomingTasks(studentId: string) {
    // Get enrolled course IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    // Get tasks that are due soon and not submitted
    const now = new Date();
    const upcomingTasks = await prisma.task.findMany({
      where: {
        courseId: { in: courseIds },
        dueDate: {
          gte: now,
        },
        TaskSubmission: {
          none: {
            studentId: studentId,
          },
        },
      },
      include: {
        Course: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 5,
    });

    return upcomingTasks.map((task) => ({
      id: task.id,
      title: task.title,
      courseTitle: task.Course?.title || 'Unknown',
      courseCode: task.Course?.code || 'N/A',
      dueDate: task.dueDate,
      type: task.type,
      maxPoints: task.maxPoints,
    }));
  }
}
