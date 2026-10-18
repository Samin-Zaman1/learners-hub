import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAllUsers(@Query() query: any) {
    return this.adminUsersService.getAllUsers(query);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  @Post()
  async createUser(@Body() userData: any) {
    return this.adminUsersService.createUser(userData);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() userData: any) {
    return this.adminUsersService.updateUser(id, userData);
  }

  @Patch(':id')
  async patchUser(@Param('id') id: string, @Body() userData: any) {
    return this.adminUsersService.updateUser(id, userData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.adminUsersService.deleteUser(id);
  }
}
