import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateJwt(payload: any): string {
    return this.jwtService.sign(payload);
  }

  verifyJwt(token: string): any {
    return this.jwtService.verify(token);
  }
}
