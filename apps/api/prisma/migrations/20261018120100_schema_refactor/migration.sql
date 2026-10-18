-- Schema refactor: tasks, schedule events and announcements now always belong
-- to a course and record their creator; attendance is removed.
-- Existing rows are backfilled before constraints are tightened. Rows that
-- have no course can't be represented in the new model and are removed.

-- DropForeignKey
ALTER TABLE "public"."Announcement" DROP CONSTRAINT "Announcement_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttendanceRecord" DROP CONSTRAINT "AttendanceRecord_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttendanceRecord" DROP CONSTRAINT "AttendanceRecord_markedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttendanceRecord" DROP CONSTRAINT "AttendanceRecord_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScheduleEvent" DROP CONSTRAINT "ScheduleEvent_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScheduleEvent" DROP CONSTRAINT "ScheduleEvent_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_userId_fkey";

-- DropIndex
DROP INDEX "public"."Course_instructorId_idx";

-- DropIndex
DROP INDEX "public"."CourseMaterial_courseId_idx";

-- DropIndex
DROP INDEX "public"."CourseMaterial_moduleId_idx";

-- DropIndex
DROP INDEX "public"."CourseModule_courseId_idx";

-- DropIndex
DROP INDEX "public"."TaskSubmission_studentId_idx";

-- DropIndex
DROP INDEX "public"."TaskSubmission_taskId_idx";

-- AlterTable
ALTER TABLE "public"."Activity" ADD COLUMN     "taskId" TEXT;

-- AlterTable: announcements are created by the course instructor
DELETE FROM "public"."Announcement" WHERE "courseId" IS NULL;
ALTER TABLE "public"."Announcement" ADD COLUMN "createdBy" TEXT;
UPDATE "public"."Announcement" a SET "createdBy" = c."instructorId"
FROM "public"."Course" c WHERE c."id" = a."courseId";
ALTER TABLE "public"."Announcement" DROP COLUMN "author",
ALTER COLUMN "createdBy" SET NOT NULL,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "courseId" SET NOT NULL;

-- AlterTable
UPDATE "public"."Course" SET "level" = 'Beginner' WHERE "level" IS NULL;
ALTER TABLE "public"."Course" DROP COLUMN "maxEnrollments",
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "objectives" TEXT[],
ADD COLUMN     "prerequisites" TEXT[],
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ALTER COLUMN "level" SET NOT NULL,
ALTER COLUMN "level" SET DEFAULT 'Beginner';

-- AlterTable
ALTER TABLE "public"."CourseMaterial" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "order" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."CourseModule" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "order" DROP DEFAULT;

-- AlterTable: personal (course-less) events are dropped; creator and start date are backfilled
DELETE FROM "public"."ScheduleEvent" WHERE "courseId" IS NULL;
UPDATE "public"."ScheduleEvent" SET "createdBy" = "userId" WHERE "createdBy" IS NULL;
UPDATE "public"."ScheduleEvent" SET "startDate" = "date" WHERE "startDate" IS NULL;
ALTER TABLE "public"."ScheduleEvent" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."ScheduleEvent" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "public"."ScheduleEvent" DROP COLUMN "date",
DROP COLUMN "instructor",
DROP COLUMN "userId",
ALTER COLUMN "courseId" SET NOT NULL,
ALTER COLUMN "createdBy" SET NOT NULL,
ALTER COLUMN "recurrence" DROP DEFAULT,
ALTER COLUMN "startDate" SET NOT NULL;

-- AlterTable: personal (course-less) tasks are dropped; creator is backfilled.
-- Per-student progress/status now lives on TaskSubmission.
DELETE FROM "public"."Task" WHERE "courseId" IS NULL;
UPDATE "public"."Task" SET "createdBy" = "userId" WHERE "createdBy" IS NULL;
ALTER TABLE "public"."Task" DROP COLUMN "progress",
DROP COLUMN "status",
DROP COLUMN "userId",
ALTER COLUMN "courseId" SET NOT NULL,
ALTER COLUMN "createdBy" SET NOT NULL,
ALTER COLUMN "maxPoints" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."TaskSubmission" DROP COLUMN "fileUrl",
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- Convert SubmissionStatus -> TaskStatus, keeping each submission's status (LATE -> COMPLETED)
ALTER TABLE "public"."TaskSubmission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."TaskSubmission" ALTER COLUMN "status" TYPE "public"."TaskStatus"
USING (CASE "status"::text WHEN 'LATE' THEN 'COMPLETED' ELSE "status"::text END)::"public"."TaskStatus";
ALTER TABLE "public"."TaskSubmission" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- DropTable
DROP TABLE "public"."Attendance";

-- DropTable
DROP TABLE "public"."AttendanceRecord";

-- DropEnum
DROP TYPE "public"."AttendanceRecordStatus";

-- DropEnum
DROP TYPE "public"."AttendanceStatus";

-- DropEnum
DROP TYPE "public"."SubmissionStatus";

-- CreateTable
CREATE TABLE "public"."ScheduleTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pattern" TEXT NOT NULL,
    "events" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseInvitation" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseInvitation_courseId_studentId_key" ON "public"."CourseInvitation"("courseId", "studentId");

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleEvent" ADD CONSTRAINT "ScheduleEvent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleEvent" ADD CONSTRAINT "ScheduleEvent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleTemplate" ADD CONSTRAINT "ScheduleTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseInvitation" ADD CONSTRAINT "CourseInvitation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseInvitation" ADD CONSTRAINT "CourseInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseInvitation" ADD CONSTRAINT "CourseInvitation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

