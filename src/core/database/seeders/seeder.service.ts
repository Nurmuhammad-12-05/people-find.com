import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger: Logger;

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(SeederService.name);
  }

  async sendAll() {
    await this.sendUsers();
  }

  async sendUsers() {
    this.logger.log('Admin seedr started');

    const email = this.configService.get('SUPERADMIN_EMAIL') as string;
    const password = this.configService.get('SUPERADMIN_PASSWORD') as string;
    const name = this.configService.get('SUPERADMIN_NAME') as string;

    const findEmail = await this.db.prisma.user.findUnique({
      where: { email: email },
    });

    if (!findEmail) {
      const hashPassword = await bcrypt.hash(password, 12);

      await this.db.prisma.user.create({
        data: {
          email: email,
          password: password,
          name: name,
          role: 'SUPERADMIN',
        },
      });

      this.logger.log('Admin seedrs ended');
    }

    return true;
  }

  async onModuleInit() {
    try {
      await this.sendAll();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
