import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisRateLimitService {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
    });
  }

  async checkLimit(key: string, limit = 5, ttl = 60): Promise<void> {
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, ttl);
    }

    if (current > limit) {
      const timeLeft = await this.redis.ttl(key);
      throw new HttpException(
        `Too many requests. Please wait ${timeLeft} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
