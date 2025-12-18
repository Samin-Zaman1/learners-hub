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
  Query,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { ActivityService } from '../services/activity.service';
import { CreateActivityDto, UpdateActivityDto, ActivityFilterDto } from '../dto/activity.dto';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createActivity(
    @Request() req: any,
    @Body() createActivityDto: CreateActivityDto
  ) {
    return this.activityService.createActivity(req.user.sub, createActivityDto);
  }

  @Get()
  async getUserActivities(
    @Request() req: any,
    @Query() filterDto: ActivityFilterDto
  ) {
    return this.activityService.findUserActivities(req.user.sub, filterDto);
  }

  @Get('stats')
  async getActivityStats(@Request() req: any) {
    return this.activityService.getActivityStats(req.user.sub);
  }

  @Get('recent')
  async getRecentActivities(
    @Request() req: any,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.activityService.getRecentActivities(req.user.sub, limitNum);
  }

  @Get('weekly-stats')
  async getWeeklyActivityStats(@Request() req: any) {
    return this.activityService.getWeeklyActivityStats(req.user.sub);
  }

  @Get('course/:courseId')
  async getCourseActivities(
    @Request() req: any,
    @Param('courseId') courseId: string
  ) {
    return this.activityService.getCourseActivities(req.user.sub, courseId);
  }

  @Get(':id')
  async getActivityById(
    @Request() req: any,
    @Param('id') id: string
  ) {
    return this.activityService.findActivityById(id, req.user.sub);
  }

  @Patch(':id')
  async updateActivity(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto
  ) {
    return this.activityService.updateActivity(id, req.user.sub, updateActivityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteActivity(
    @Request() req: any,
    @Param('id') id: string
  ) {
    return this.activityService.deleteActivity(id, req.user.sub);
  }
}
