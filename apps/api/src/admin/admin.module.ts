import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminCoursesController } from './admin-courses.controller';
import { AdminCoursesService } from './admin-courses.service';
import { AdminEnrollmentsController } from './admin-enrollments.controller';
import { AdminEnrollmentsService } from './admin-enrollments.service';

@Module({
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    AdminCoursesController,
    AdminEnrollmentsController,
  ],
  providers: [
    AdminDashboardService,
    AdminUsersService,
    AdminCoursesService,
    AdminEnrollmentsService,
  ],
})
export class AdminModule {}
