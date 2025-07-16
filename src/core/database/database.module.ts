import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { SeederModule } from './seeders/seeder.module';
import { RedisRateLimitService } from './redis.service';

@Global()
@Module({
  imports: [SeederModule],
  providers: [DatabaseService, RedisRateLimitService],
  exports: [DatabaseService, RedisRateLimitService],
})
export class DatabaseModule {}
