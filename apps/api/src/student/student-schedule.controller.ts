import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { StudentScheduleService } from './student-schedule.service';

@Controller('student/schedule')
@UseGuards(JwtAuthGuard)
export class StudentScheduleController {
  constructor(private readonly studentScheduleService: StudentScheduleService) {}

  @Get()
  async getStudentSchedule(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.studentScheduleService.getStudentSchedule(req.user.userId, start, end);
  }

  @Get('today')
  async getTodaySchedule(@Request() req: any) {
    return this.studentScheduleService.getTodaySchedule(req.user.userId);
  }

  @Get('week')
  async getWeekSchedule(@Request() req: any) {
    return this.studentScheduleService.getWeekSchedule(req.user.userId);
  }

  @Get('upcoming')
  async getUpcomingEvents(
    @Request() req: any,
    @Query('days') days?: string
  ) {
    const daysAhead = days ? parseInt(days) : 7;
    return this.studentScheduleService.getUpcomingEvents(req.user.userId, daysAhead);
  }
}
