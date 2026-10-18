import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminCoursesService } from './admin-courses.service';

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminCoursesController {
  constructor(private readonly adminCoursesService: AdminCoursesService) {}

  @Get()
  async getAllCourses(@Query() query: any) {
    return this.adminCoursesService.getAllCourses(query);
  }

  @Get(':id')
  async getCourseById(@Param('id') id: string) {
    return this.adminCoursesService.getCourseById(id);
  }

  @Post()
  async createCourse(@Body() courseData: any) {
    return this.adminCoursesService.createCourse(courseData);
  }

  @Put(':id')
  async updateCourse(@Param('id') id: string, @Body() courseData: any) {
    return this.adminCoursesService.updateCourse(id, courseData);
  }

  @Patch(':id')
  async patchCourse(@Param('id') id: string, @Body() courseData: any) {
    return this.adminCoursesService.updateCourse(id, courseData);
  }

  @Patch(':id/publish-to-instructor')
  async publishToInstructor(@Param('id') id: string) {
    return this.adminCoursesService.publishToInstructor(id);
  }

  @Delete(':id')
  async deleteCourse(@Param('id') id: string) {
    return this.adminCoursesService.deleteCourse(id);
  }
}
