import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { StudentCourseController } from './student-course.controller';
import { StudentCourseService } from './student-course.service';
import { StudentTaskController } from './student-task.controller';
import { StudentTaskService } from './student-task.service';
import { StudentScheduleController } from './student-schedule.controller';
import { StudentScheduleService } from './student-schedule.service';
import { StudentSemesterService } from './student-semester.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [StudentCourseController, StudentTaskController, StudentScheduleController],
  providers: [StudentCourseService, StudentTaskService, StudentScheduleService, StudentSemesterService, PrismaClient],
  exports: [StudentCourseService, StudentTaskService, StudentScheduleService, StudentSemesterService]
})
export class StudentModule {}
