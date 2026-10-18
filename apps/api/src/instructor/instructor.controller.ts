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
  HttpCode,
  ForbiddenException
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { InstructorCourseService } from './instructor-course.service';
import { InstructorTaskService } from './instructor-task.service';
import { InstructorScheduleService } from './instructor-schedule.service';
import { InstructorAnnouncementService } from './instructor-announcement.service';
import { InstructorMaterialService } from './instructor-material.service';
import { InstructorCalendarService } from './instructor-calendar.service';
import type { CreateCourseDto, UpdateCourseDto } from './instructor-course.service';
import type { CreateTaskDto, GradeSubmissionDto } from './instructor-task.service';
import type { CreateScheduleEventDto, UpdateScheduleEventDto } from './instructor-schedule.service';
import type { CreateAnnouncementDto, UpdateAnnouncementDto } from './instructor-announcement.service';
import type { CreateModuleDto, UpdateModuleDto, CreateMaterialDto, UpdateMaterialDto } from './instructor-material.service';

interface InviteStudentDto {
  studentEmail: string;
}

@Controller('instructor')
@UseGuards(JwtAuthGuard)
export class InstructorController {
  constructor(
    private readonly instructorCourseService: InstructorCourseService,
    private readonly instructorTaskService: InstructorTaskService,
    private readonly instructorScheduleService: InstructorScheduleService,
    private readonly instructorAnnouncementService: InstructorAnnouncementService,
    private readonly instructorMaterialService: InstructorMaterialService,
    private readonly instructorCalendarService: InstructorCalendarService
  ) {}

  private checkInstructorRole(user: any) {
    if (!user || user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Access denied. Instructor role required.');
    }
  }

  @Get('stats')
  async getInstructorStats(@Request() req: any) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.getInstructorStats(req.user.userId);
  }

  @Get('courses')
  async getInstructorCourses(@Request() req: any) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.getInstructorCourses(req.user.userId);
  }

  @Post('courses')
  @HttpCode(HttpStatus.CREATED)
  async createCourse(
    @Request() req: any,
    @Body() createCourseDto: CreateCourseDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.createCourse(req.user.userId, createCourseDto);
  }

  @Get('courses/:id')
  async getCourseById(
    @Request() req: any,
    @Param('id') id: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.getCourseById(id, req.user.userId);
  }

  @Patch('courses/:id')
  async updateCourse(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.updateCourse(id, req.user.userId, updateCourseDto);
  }

  @Delete('courses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourse(
    @Request() req: any,
    @Param('id') id: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.deleteCourse(id, req.user.userId);
  }

  @Patch('courses/:id/publish')
  async publishCourseToStudents(
    @Request() req: any,
    @Param('id') id: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.publishToStudents(id, req.user.userId);
  }


  @Post('courses/:id/invite-student')
  async inviteStudent(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() inviteStudentDto: InviteStudentDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.inviteStudent(
      courseId, 
      req.user.userId, 
      inviteStudentDto.studentEmail
    );
  }

  @Delete('courses/:courseId/students/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStudent(
    @Request() req: any,
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.removeStudent(courseId, studentId, req.user.userId);
  }

  @Post('courses/:id/generate-code')
  async generateInvitationCode(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.generateInvitationCode(courseId, req.user.userId);
  }

  @Get('courses/:id/invitation-code')
  async getInvitationCode(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.getInvitationCode(courseId, req.user.userId);
  }

  @Get('courses/:id/students')
  async getEnrolledStudents(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.getEnrolledStudents(courseId, req.user.userId);
  }

  @Post('courses/:id/publish')
  @HttpCode(HttpStatus.OK)
  async publishCourse(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.publishCourse(courseId, req.user.userId);
  }

  @Post('courses/:id/unpublish')
  @HttpCode(HttpStatus.OK)
  async unpublishCourse(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCourseService.unpublishCourse(courseId, req.user.userId);
  }

  // ============ Task Management Endpoints ============

  @Post('courses/:id/tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() createTaskDto: CreateTaskDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.createTask(req.user.userId, courseId, createTaskDto);
  }

  @Get('courses/:id/tasks')
  async getCourseTasks(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.getCourseTasks(req.user.userId, courseId);
  }

  @Get('courses/:id/tasks/:taskId')
  async getTaskById(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('taskId') taskId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.getTaskById(req.user.userId, courseId, taskId);
  }

  @Get('courses/:id/tasks/:taskId/submissions')
  async getTaskSubmissions(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('taskId') taskId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.getTaskSubmissions(req.user.userId, courseId, taskId);
  }

  @Patch('courses/:id/tasks/:taskId/submissions/:submissionId')
  async gradeSubmission(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('taskId') taskId: string,
    @Param('submissionId') submissionId: string,
    @Body() gradeData: GradeSubmissionDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.gradeSubmission(
      req.user.userId,
      courseId,
      taskId,
      submissionId,
      gradeData
    );
  }

  @Patch('courses/:id/tasks/:taskId')
  async updateTask(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('taskId') taskId: string,
    @Body() updateData: Partial<CreateTaskDto>
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.updateTask(req.user.userId, courseId, taskId, updateData);
  }

  @Delete('courses/:id/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('taskId') taskId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.deleteTask(req.user.userId, courseId, taskId);
  }

  @Get('courses/:id/submissions')
  async getAllCourseSubmissions(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() filters?: { taskId?: string; status?: string; studentId?: string }
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.getAllCourseSubmissions(req.user.userId, courseId, filters);
  }

  @Post('courses/:id/tasks/bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreateTasks(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() body: { tasks: CreateTaskDto[] }
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.bulkCreateTasks(req.user.userId, courseId, body.tasks);
  }

  @Post('courses/:id/tasks/:taskId/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicateTask(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('taskId') taskId: string,
    @Body() body?: { newDueDate?: string }
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.duplicateTask(req.user.userId, courseId, taskId, body?.newDueDate);
  }

  @Patch('courses/:id/tasks/:taskId/grade-bulk')
  async bulkGradeSubmissions(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('taskId') taskId: string,
    @Body() body: { grades: Array<{ submissionId: string; points?: number; feedback?: string }> }
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorTaskService.bulkGradeSubmissions(req.user.userId, courseId, taskId, body.grades);
  }

  // ============ Schedule Management Endpoints ============

  @Post('courses/:id/schedule')
  @HttpCode(HttpStatus.CREATED)
  async createScheduleEvent(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() createDto: CreateScheduleEventDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.createScheduleEvent(req.user.userId, courseId, createDto);
  }

  @Post('courses/:id/schedule/bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreateScheduleEvents(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() events: CreateScheduleEventDto[]
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.bulkCreateScheduleEvents(req.user.userId, courseId, events);
  }

  @Get('courses/:id/schedule')
  async getCourseSchedule(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.getCourseSchedule(req.user.userId, courseId);
  }

  @Get('courses/:id/schedule/statistics')
  async getScheduleStatistics(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.getScheduleStatistics(req.user.userId, courseId);
  }

  @Post('courses/:id/schedule/save-template')
  @HttpCode(HttpStatus.CREATED)
  async saveScheduleAsTemplate(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() templateData: { name: string; description?: string }
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.saveAsTemplate(req.user.userId, courseId, templateData);
  }

  @Get('schedule-templates')
  async getScheduleTemplates(@Request() req: any) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.getTemplates(req.user.userId);
  }

  @Post('courses/:id/schedule/apply-template')
  @HttpCode(HttpStatus.CREATED)
  async applyScheduleTemplate(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() body: { templateId: string; startDate: string }
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.applyTemplate(req.user.userId, courseId, body.templateId, body.startDate);
  }

  @Delete('schedule-templates/:templateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteScheduleTemplate(
    @Request() req: any,
    @Param('templateId') templateId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.deleteTemplate(req.user.userId, templateId);
  }

  @Get('courses/:id/schedule/:scheduleId')
  async getScheduleEventById(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('scheduleId') scheduleId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.getScheduleEventById(req.user.userId, courseId, scheduleId);
  }

  @Patch('courses/:id/schedule/:scheduleId')
  async updateScheduleEvent(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() updateDto: UpdateScheduleEventDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.updateScheduleEvent(req.user.userId, courseId, scheduleId, updateDto);
  }

  @Delete('courses/:id/schedule/:scheduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteScheduleEvent(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('scheduleId') scheduleId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorScheduleService.deleteScheduleEvent(req.user.userId, courseId, scheduleId);
  }

  // ============ Announcement Management Endpoints ============

  @Post('courses/:id/announcements')
  @HttpCode(HttpStatus.CREATED)
  async createAnnouncement(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() createDto: CreateAnnouncementDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorAnnouncementService.createAnnouncement(req.user.userId, courseId, createDto);
  }

  @Get('courses/:id/announcements')
  async getCourseAnnouncements(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorAnnouncementService.getCourseAnnouncements(req.user.userId, courseId);
  }

  @Get('courses/:id/announcements/statistics')
  async getAnnouncementStatistics(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorAnnouncementService.getAnnouncementStatistics(req.user.userId, courseId);
  }

  @Get('courses/:id/announcements/:announcementId')
  async getAnnouncementById(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('announcementId') announcementId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorAnnouncementService.getAnnouncementById(req.user.userId, courseId, announcementId);
  }

  @Patch('courses/:id/announcements/:announcementId')
  async updateAnnouncement(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('announcementId') announcementId: string,
    @Body() updateDto: UpdateAnnouncementDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorAnnouncementService.updateAnnouncement(req.user.userId, courseId, announcementId, updateDto);
  }

  @Patch('courses/:id/announcements/:announcementId/toggle-pin')
  async togglePin(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('announcementId') announcementId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorAnnouncementService.togglePin(req.user.userId, courseId, announcementId);
  }

  @Delete('courses/:id/announcements/:announcementId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAnnouncement(
    @Request() req: any,
    @Param('id') courseId: string,
    @Param('announcementId') announcementId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorAnnouncementService.deleteAnnouncement(req.user.userId, courseId, announcementId);
  }

  // ============ COURSE MODULES ============

  @Post('courses/:id/modules')
  @HttpCode(HttpStatus.CREATED)
  async createModule(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() createDto: CreateModuleDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorMaterialService.createModule(courseId, req.user.userId, createDto);
  }

  @Get('courses/:id/modules')
  async getModules(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorMaterialService.getModules(courseId, req.user.userId);
  }

  @Patch('modules/:moduleId')
  async updateModule(
    @Request() req: any,
    @Param('moduleId') moduleId: string,
    @Body() updateDto: UpdateModuleDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorMaterialService.updateModule(moduleId, req.user.userId, updateDto);
  }

  @Delete('modules/:moduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModule(
    @Request() req: any,
    @Param('moduleId') moduleId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorMaterialService.deleteModule(moduleId, req.user.userId);
  }

  // ============ COURSE MATERIALS ============

  @Post('courses/:id/materials')
  @HttpCode(HttpStatus.CREATED)
  async createMaterial(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() createDto: CreateMaterialDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorMaterialService.createMaterial(courseId, req.user.userId, createDto);
  }

  @Get('courses/:id/materials')
  async getMaterials(
    @Request() req: any,
    @Param('id') courseId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorMaterialService.getMaterials(courseId, req.user.userId);
  }

  @Patch('materials/:materialId')
  async updateMaterial(
    @Request() req: any,
    @Param('materialId') materialId: string,
    @Body() updateDto: UpdateMaterialDto
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorMaterialService.updateMaterial(materialId, req.user.userId, updateDto);
  }

  @Delete('materials/:materialId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMaterial(
    @Request() req: any,
    @Param('materialId') materialId: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorMaterialService.deleteMaterial(materialId, req.user.userId);
  }

  // ==================== Calendar Endpoints ====================

  @Get('calendar/monthly/:year/:month')
  async getMonthlyCalendar(
    @Request() req: any,
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCalendarService.getMonthlySchedule(
      req.user.userId,
      parseInt(year),
      parseInt(month)
    );
  }

  @Get('calendar/weekly')
  async getWeeklyCalendar(@Request() req: any) {
    this.checkInstructorRole(req.user);
    const startDate = req.query?.startDate || new Date().toISOString();
    return this.instructorCalendarService.getWeeklySchedule(req.user.userId, startDate);
  }

  @Get('calendar/daily/:date')
  async getDailyCalendar(
    @Request() req: any,
    @Param('date') date: string
  ) {
    this.checkInstructorRole(req.user);
    return this.instructorCalendarService.getDailySchedule(req.user.userId, date);
  }

  @Get('calendar/upcoming')
  async getUpcomingEvents(@Request() req: any) {
    this.checkInstructorRole(req.user);
    const days = parseInt(req.query?.days || '7');
    return this.instructorCalendarService.getUpcomingEvents(req.user.userId, days);
  }

  @Get('calendar/stats')
  async getCalendarStats(@Request() req: any) {
    this.checkInstructorRole(req.user);
    return this.instructorCalendarService.getCalendarStats(req.user.userId);
  }
}
