-- Enum values are added in their own migration: PostgreSQL can't use a new
-- enum value in the same transaction that adds it, and the next migration
-- converts existing submissions to TaskStatus (including 'GRADED').

-- AlterEnum
ALTER TYPE "public"."CourseStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "public"."CourseStatus" ADD VALUE 'PUBLISHED';
ALTER TYPE "public"."CourseStatus" ADD VALUE 'ARCHIVED';

-- AlterEnum
ALTER TYPE "public"."MaterialType" ADD VALUE 'PDF';
ALTER TYPE "public"."MaterialType" ADD VALUE 'AUDIO';

-- AlterEnum
ALTER TYPE "public"."TaskStatus" ADD VALUE 'GRADED';
