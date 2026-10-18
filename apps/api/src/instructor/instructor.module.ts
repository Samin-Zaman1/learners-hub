import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InstructorController } from './instructor.controller';
import { InstructorCourseService } from './instructor-course.service';
import { InstructorTaskService } from './instructor-task.service';
import { InstructorScheduleService } from './instructor-schedule.service';
import { InstructorAnnouncementService } from './instructor-announcement.service';
import { InstructorMaterialService } from './instructor-material.service';
import { InstructorCalendarService } from './instructor-calendar.service';

@Module({
  controllers: [InstructorController],
  providers: [
    PrismaClient,
    InstructorCourseService,
    InstructorTaskService,
    InstructorScheduleService,
    InstructorAnnouncementService,
    InstructorMaterialService,
    InstructorCalendarService,
  ],
  exports: [InstructorCourseService, InstructorTaskService, InstructorScheduleService, InstructorAnnouncementService, InstructorMaterialService, InstructorCalendarService],
})
export class InstructorModule {}
