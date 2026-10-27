import { StudentCourseService } from "./student-course.service";

describe('studentCourseService', () => {
   let service: StudentCourseService;
   let fakePrisma: any;
    beforeEach(() => {
        fakePrisma = {
            enrollment: {findMany: jest.fn()},
            course: {findUnique: jest.fn()},
        };
        service = new StudentCourseService(fakePrisma);
    }); 
    describe ('getEnrolledCourses', () => {
        it('should return an enrollment', async() => {
            let studentId = 'student 1'
            fakePrisma.enrollment.findMany.mockResolvedValue([
                {
                enrolledAt: new Date('2026-01-15'),
                status: 'ACTIVE',
                Course: { id: 'course 1', 
                          title: 'Math'}
                },
            ]);
            // Act: call the real service method
            const result = await service.getEnrolledCourses(studentId);
            // Assert: (your turn)
            expect(result).toEqual([
                {
                    id: 'course 1',
                    title: 'Math',
                    enrolledAt: new Date('2026-01-15'),
                    enrollmentStatus: 'ACTIVE'
                }
            ])
        });
        it ('should return an empty list when the student has no courses', async() => {
            fakePrisma.enrollment.findMany.mockResolvedValue([])
            const studentId = 'student 1';
            const result = await service.getEnrolledCourses(studentId);
            expect(result).toEqual([]);
        })
        it('should only ask the student active enrollments', async() => {
            fakePrisma.enrollment.findMany.mockResolvedValue([])
            await service.getEnrolledCourses('student 1')
            expect(fakePrisma.enrollment.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: 'student 1',
                        status: 'ACTIVE',
                        Course: {
                            status: 'ACTIVE'
                        }
                    }
                })
            )
        })
    })
    describe ('previewCourseByCode', () => {
        it('should return badRequestException for Invalid Code Format', async()=> {
            await expect(
                service.previewCourseByCode('abc'),
            ).rejects.toThrow('Invalid invitation code format')
        })
        it('should return NotFoundException if there is not course with that code', async() => {
            fakePrisma.course.findUnique.mockResolvedValue(null)
            await expect (
                service.previewCourseByCode('ABCD-2345'),
            ).rejects.toThrow('Course not found with this invitation code')
        })
        it('should return BadRequestException if the course is not published yet', async() => {
            fakePrisma.course.findUnique.mockResolvedValue(
                {
                    status: "DRAFT"
                }
            )
            await expect (
                service.previewCourseByCode('ABCD-2345'),
            ).rejects.toThrow('This course is not published yet')
        })
        it('should return a preview of a published course', async() => {
            // Arrange: every field the code reads on lines 80-96
            fakePrisma.course.findUnique.mockResolvedValue(
                {
                    status: "ACTIVE",
                    id: "course 1",
                    title: "Math",
                    code: "MATH101",
                    description: "Intro to algebra",
                    instructor: { email: "teacher@school.com" },
                    color: "#667eea",
                    credits: 3,
                    semester: "Fall 2026",
                    level: "Beginner",
                    _count: { Enrollment: 25, CourseMaterial: 8 }
                }
            )

            // Act: no expect() around it, because it doesn't throw
            const result = await service.previewCourseByCode('ABCD-2345')

            // Assert: field names from the left side of the return
            expect(result).toEqual({
                id: "course 1",
                title: "Math",
                code: "MATH101",
                description: "Intro to algebra",
                instructor: "teacher@school.com", // object -> just the email
                color: "#667eea",
                credits: 3,
                semester: "Fall 2026",
                level: "Beginner",
                enrollmentCount: 25,              // from _count.Enrollment
                materialCount: 8                  // from _count.CourseMaterial
            })
        })
    })
});