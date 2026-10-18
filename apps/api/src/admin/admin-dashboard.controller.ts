import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.adminDashboardService.getDashboardStats();
  }

  @Get('recent-activity')
  async getRecentActivity(@Request() req: any) {
    return this.adminDashboardService.getRecentActivity();
  }
}
