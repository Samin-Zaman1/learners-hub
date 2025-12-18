import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { StudentTaskService } from './student-task.service';
import type { UpdateSubmissionDto } from './student-task.service';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentTaskController {
  constructor(private readonly studentTaskService: StudentTaskService) {}

  @Get('tasks')
  async getAssignedTasks(@Request() req: any) {
    return this.studentTaskService.getAssignedTasks(req.user.userId);
  }

  @Get('tasks/statistics')
  async getTaskStatistics(@Request() req: any) {
    return this.studentTaskService.getTaskStatistics(req.user.userId);
  }

  @Get('tasks/upcoming')
  async getUpcomingTasks(@Request() req: any) {
    return this.studentTaskService.getUpcomingTasks(req.user.userId);
  }

  @Get('tasks/:id')
  async getTaskSubmission(
    @Request() req: any,
    @Param('id') submissionId: string
  ) {
    return this.studentTaskService.getTaskSubmission(req.user.userId, submissionId);
  }

  @Patch('tasks/:id')
  @HttpCode(HttpStatus.OK)
  async updateSubmission(
    @Request() req: any,
    @Param('id') submissionId: string,
    @Body() updateData: UpdateSubmissionDto
  ) {
    return this.studentTaskService.updateSubmission(req.user.userId, submissionId, updateData);
  }
}
