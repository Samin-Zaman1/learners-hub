import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { StudentCourseService } from './student-course.service';
import { StudentSemesterService } from './student-semester.service';

interface EnrollWithCodeDto {
  invitationCode: string;
}

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class StudentCourseController {
  constructor(
    private readonly studentCourseService: StudentCourseService,
    private readonly studentSemesterService: StudentSemesterService
  ) {}

  @Get('enrolled')
  async getEnrolledCourses(@Request() req: any) {
    return this.studentCourseService.getEnrolledCourses(req.user.userId);
  }

  @Get('preview/:code')
  async previewCourseByCode(@Param('code') code: string) {
    return this.studentCourseService.previewCourseByCode(code);
  }

  @Post('enroll')
  @HttpCode(HttpStatus.CREATED)
  async enrollWithCode(
    @Request() req: any,
    @Body() enrollWithCodeDto: EnrollWithCodeDto
  ) {
    return this.studentCourseService.enrollWithCode(
      req.user.userId, 
      enrollWithCodeDto.invitationCode
    );
  }

  @Delete(':id/unenroll')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unenrollFromCourse(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    return this.studentCourseService.unenrollFromCourse(req.user.userId, courseId);
  }

  @Get(':id')
  async getCourseDetails(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    return this.studentCourseService.getCourseDetails(req.user.userId, courseId);
  }

  // Semester endpoints
  @Get('semesters/list')
  async getSemesters(@Request() req: any) {
    return this.studentSemesterService.getSemesters(req.user.userId);
  }

  @Get('semesters/statistics')
  async getSemesterStatistics(@Request() req: any) {
    return this.studentSemesterService.getSemesterStatistics(req.user.userId);
  }

  @Get('semesters/available')
  async getAvailableCourses(@Request() req: any) {
    return this.studentSemesterService.getAvailableCourses(req.user.userId);
  }

  @Get('semesters/upcoming-tasks')
  async getUpcomingTasks(@Request() req: any) {
    return this.studentSemesterService.getUpcomingTasks(req.user.userId);
  }

  @Get('semesters/:semester/courses')
  async getCoursesBySemester(
    @Request() req: any,
    @Param('semester') semester: string
  ) {
    return this.studentSemesterService.getCoursesBySemester(req.user.userId, semester);
  }
}
