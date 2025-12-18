import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { StudentScheduleService } from '../../student/student-schedule.service';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: StudentScheduleService) {}

  @Get()
  async getSchedule(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.scheduleService.getStudentSchedule(req.user.userId, start, end);
  }

  @Get('today')
  async getTodaySchedule(@Request() req: any) {
    return this.scheduleService.getTodaySchedule(req.user.userId);
  }

  @Get('week')
  async getWeekSchedule(@Request() req: any) {
    return this.scheduleService.getWeekSchedule(req.user.userId);
  }

  @Get('upcoming')
  async getUpcomingEvents(
    @Request() req: any,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.scheduleService.getUpcomingEvents(req.user.userId, limitNum);
  }

  @Get('stats')
  async getScheduleStats(@Request() req: any) {
    // Return basic stats for now
    const events = await this.scheduleService.getStudentSchedule(req.user.userId);
    return {
      totalEvents: events.length,
      upcomingEvents: events.filter((e: any) => new Date(e.date) >= new Date()).length
    };
  }
}
