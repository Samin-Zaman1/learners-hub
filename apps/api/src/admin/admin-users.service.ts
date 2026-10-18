import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class AdminUsersService {
  async getAllUsers(query: any) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data to include full name
    return users.map(user => ({
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
      isVerified: user.verified,
    }));
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        createdAt: true,
      },
    });
  }

  async createUser(userData: any) {
    const { email, password, firstName, lastName, role } = userData;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: role || 'STUDENT',
        verified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        createdAt: true,
      },
    });

    return {
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      isVerified: user.verified,
    };
  }

  async updateUser(id: string, userData: any) {
    const { email, password, firstName, lastName, role } = userData;
    
    const updateData: any = {
      email,
      firstName,
      lastName,
      role,
    };

    // Only update password if provided
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        createdAt: true,
      },
    });

    return {
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      isVerified: user.verified,
    };
  }

  async deleteUser(id: string) {
    await prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
