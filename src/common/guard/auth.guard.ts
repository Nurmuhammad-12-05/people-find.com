import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const functionHandler = context.getHandler();

    const classHandler = context.getClass();

    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      functionHandler,
      classHandler,
    ]);

    if (isPublic) return true;

    try {
      const token = request.headers.authorization.split(' ')[1];

      const { userId, role } = await this.jwtService.verifyAsync(token);

      request.userId = userId;

      request.role = role;

      return true;
    } catch (error) {
      throw new BadRequestException('Token invalide.');
    }
  }
}
