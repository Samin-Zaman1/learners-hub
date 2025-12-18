import { IsString, IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';
import { CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  instructorId: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  credits?: number;

  @IsString()
  semester: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructorId?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  credits?: number;
}

export class EnrollCourseDto {
  @IsString()
  courseId: string;
}

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
