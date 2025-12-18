import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { CourseService } from '../services/course.service';
import { EnrollCourseDto, UpdateEnrollmentDto } from '../dto/course.dto';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async getUserEnrollments(@Request() req: any) {
    return this.courseService.getUserEnrollments(req.user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async enrollInCourse(
    @Request() req: any,
    @Body() enrollCourseDto: EnrollCourseDto
  ) {
    return this.courseService.enrollUserInCourse(req.user.sub, enrollCourseDto);
  }

  @Patch(':courseId')
  async updateEnrollment(
    @Request() req: any,
    @Param('courseId') courseId: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto
  ) {
    return this.courseService.updateEnrollment(req.user.sub, courseId, updateEnrollmentDto);
  }

  @Delete(':courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unenrollFromCourse(
    @Request() req: any,
    @Param('courseId') courseId: string
  ) {
    return this.courseService.unenrollUserFromCourse(req.user.sub, courseId);
  }
}
