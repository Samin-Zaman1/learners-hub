import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from './mail.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserProfileService } from './user-profile.service';
import { PrismaClient } from '@prisma/client';
import { DashboardModule } from './dashboard/dashboard.module';
import { InstructorModule } from './instructor/instructor.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
    DashboardModule,
    InstructorModule,
    StudentModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, PrismaClient, AuthService, MailService, JwtAuthGuard, UserProfileService],
})
export class AppModule {}
