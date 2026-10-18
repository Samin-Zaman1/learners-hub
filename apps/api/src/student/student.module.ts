import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { StudentCourseController } from './student-course.controller';
import { StudentCourseService } from './student-course.service';
import { StudentTaskController } from './student-task.controller';
import { StudentTaskService } from './student-task.service';
import { StudentScheduleController } from './student-schedule.controller';
import { StudentScheduleService } from './student-schedule.service';
import { StudentSemesterService } from './student-semester.service';

@Module({
  controllers: [StudentCourseController, StudentTaskController, StudentScheduleController],
  providers: [StudentCourseService, StudentTaskService, StudentScheduleService, StudentSemesterService, PrismaClient],
  exports: [StudentCourseService, StudentTaskService, StudentScheduleService, StudentSemesterService]
})
export class StudentModule {}
