import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisClientType } from 'redis';

@Injectable()
export class BlacklistGuard implements CanActivate {
  constructor(
    @Inject('REDIS_CLIENT') private redis: RedisClientType,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const isBlacklisted = await this.redis.get(`bl:${token}`);

    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return true;
  }
}
