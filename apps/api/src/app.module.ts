import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Registered once, globally: every module verifies tokens with this secret.
    // registerAsync so the secret is read after ConfigModule has loaded .env.
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret && process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET must be set in production');
        }
        return {
          secret: secret || 'dev-only-jwt-secret',
          signOptions: { expiresIn: '7d' },
        };
      },
    }),
    DashboardModule,
    InstructorModule,
    StudentModule,
    AdminModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, PrismaClient, AuthService, MailService, JwtAuthGuard, UserProfileService],
})
export class AppModule {}
