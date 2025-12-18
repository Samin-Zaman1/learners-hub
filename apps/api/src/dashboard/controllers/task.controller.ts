import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { StudentTaskService } from '../../student/student-task.service';

@Controller('dashboard/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: StudentTaskService) {}

  @Get('upcoming')
  async getUpcomingTasks(@Request() req: any) {
    return this.taskService.getUpcomingTasks(req.user.userId);
  }

  @Get('statistics')
  async getTaskStatistics(@Request() req: any) {
    return this.taskService.getTaskStatistics(req.user.userId);
  }

  @Get()
  async getAllTasks(@Request() req: any) {
    return this.taskService.getAssignedTasks(req.user.userId);
  }
}
