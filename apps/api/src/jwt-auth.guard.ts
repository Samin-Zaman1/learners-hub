import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      console.log('JwtAuthGuard: No authorization header');
      return false;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('JwtAuthGuard: No token found');
      return false;
    }
    try {
      const payload = this.jwtService.verify(token);
      console.log('JwtAuthGuard: Token verified, payload:', payload);
      request.user = payload;
      return true;
    } catch (error) {
      console.log('JwtAuthGuard: Token verification failed:', error.message);
      return false;
    }
  }
}
