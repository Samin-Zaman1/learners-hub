import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminEnrollmentsService } from './admin-enrollments.service';

@Controller('admin/enrollments')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminEnrollmentsController {
  constructor(
    private readonly enrollmentsService: AdminEnrollmentsService,
  ) {}

  @Get()
  async getAllEnrollments() {
    return this.enrollmentsService.getAllEnrollments();
  }
}
