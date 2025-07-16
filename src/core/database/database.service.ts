import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public readonly prisma: PrismaClient;
  private readonly logger: Logger;

  constructor() {
    this.prisma = new PrismaClient();
    this.logger = new Logger(DatabaseService.name);
  }

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log('Database connected');
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.prisma.$disconnect();
    } catch (error) {
      this.logger.error(error);
      process.exit(1);
    }
  }
}
