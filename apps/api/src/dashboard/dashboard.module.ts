import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CourseController } from './controllers/course.controller';
import { ActivityController } from './controllers/activity.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { TaskController } from './controllers/task.controller';
import { AnnouncementController } from './controllers/announcement.controller';
import { CourseService } from './services/course.service';
import { ActivityService } from './services/activity.service';
import { StudentScheduleService } from '../student/student-schedule.service';
import { StudentTaskService } from '../student/student-task.service';

@Module({
  controllers: [
    CourseController, 
    ActivityController,
    EnrollmentController,
    ScheduleController,
    TaskController,
    AnnouncementController
  ],
  providers: [
    PrismaClient,
    CourseService,
    ActivityService,
    StudentScheduleService,
    StudentTaskService,
  ],
  exports: [
    CourseService, 
    ActivityService,
  ],
})
export class DashboardModule {}
