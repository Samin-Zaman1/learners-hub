import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { CourseService } from '../services/course.service';
import { CreateCourseDto, UpdateCourseDto, EnrollCourseDto, UpdateEnrollmentDto } from '../dto/course.dto';

@Controller('api/courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.createCourse(createCourseDto);
  }

  @Get()
  async findAllCourses() {
    return this.courseService.findAllCourses();
  }

  @Get(':id')
  async findCourseById(@Param('id') id: string) {
    return this.courseService.findCourseById(id);
  }

  @Put(':id')
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto
  ) {
    return this.courseService.updateCourse(id, updateCourseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourse(@Param('id') id: string) {
    return this.courseService.deleteCourse(id);
  }

  @Post('enroll')
  @HttpCode(HttpStatus.CREATED)
  async enrollInCourse(
    @Request() req,
    @Body() enrollCourseDto: EnrollCourseDto
  ) {
    return this.courseService.enrollUserInCourse(req.user.id, enrollCourseDto);
  }

  @Get('my/enrollments')
  async getMyEnrollments(@Request() req) {
    return this.courseService.getUserEnrollments(req.user.id);
  }

  @Put('my/enrollments/:courseId')
  async updateMyEnrollment(
    @Request() req,
    @Param('courseId') courseId: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto
  ) {
    return this.courseService.updateEnrollment(req.user.id, courseId, updateEnrollmentDto);
  }

  @Delete('my/enrollments/:courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unenrollFromCourse(
    @Request() req,
    @Param('courseId') courseId: string
  ) {
    return this.courseService.unenrollUserFromCourse(req.user.id, courseId);
  }
}
