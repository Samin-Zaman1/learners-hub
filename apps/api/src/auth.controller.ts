
import { Body, Controller, Get, Post, Patch, Inject, UseGuards, Req, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './mail.service';
import { UserProfileService } from './user-profile.service';
import type { UpdateProfileDto, ChangePasswordDto } from './user-profile.service';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly userProfileService: UserProfileService
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string; role?: string }) {
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return { ok: false, message: 'Invalid credentials' };
    if (!user.verified) return { ok: false, message: 'Email not verified' };
    
    // Verify password first
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return { ok: false, message: 'Invalid credentials' };
    
    // If role is provided in request, validate it matches (backward compatibility)
    // Otherwise, use the role from database (auto-detect)
    if (body.role && user.role !== body.role) {
      return { 
        ok: false, 
        message: `This account is registered as ${user.role.toLowerCase()}. Please select the correct role or leave it blank.` 
      };
    }
    
    // Generate JWT token with role information from database
    const token = this.authService.generateJwt({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    console.log('Login successful:', { email: user.email, role: user.role, tokenGenerated: !!token });
    
    return { 
      ok: true, 
      email: user.email, 
      role: user.role,
      token 
    };
  }

  @Post('signup')
  async signup(@Body() body: { 
    email: string; 
    password: string; 
    role: 'STUDENT' | 'INSTRUCTOR' 
  }) {
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return { ok: false, message: 'Email already in use' };
    
    const passwordHash = await bcrypt.hash(body.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        role: body.role,
        verified: true, // Mark user as verified immediately for development
      },
    });
    
    return { 
      ok: true, 
      email: user.email, 
      role: user.role,
      message: 'Account created successfully' 
    };
  }

  // Verification endpoint disabled for development
  // @Get('verify')
  // async verify(@Body() body: { code: string }) {
  //   const user = await prisma.user.findFirst({ where: { verificationCode: body.code } });
  //   if (!user) return { ok: false, message: 'Invalid verification code' };
  //   await prisma.user.update({ where: { id: user.id }, data: { verified: true, verificationCode: null } });
  //   return { ok: true, message: 'Email verified' };
  // }
  // }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req) {
    console.log('/auth/me called, req.user:', req.user);
    
    // Get full user info from database
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return { ok: false, message: 'User not found' };
    }
    
    console.log('/auth/me returning user:', user);
    
    return { 
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.userProfileService.getUserProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: any,
    @Body() updateDto: UpdateProfileDto
  ) {
    return this.userProfileService.updateProfile(req.user.userId, updateDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req: any,
    @Body() passwordDto: ChangePasswordDto
  ) {
    return this.userProfileService.changePassword(req.user.userId, passwordDto);
  }
}
