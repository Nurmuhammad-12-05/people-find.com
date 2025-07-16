import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from 'src/core/database/database.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly raflektor: Reflector,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const functionHandler = context.getHandler();
    const classHandler = context.getClass();

    const isRole = this.raflektor.getAllAndOverride('isRole', [
      functionHandler,
      classHandler,
    ]);

    const userId = request.userId;
    const role = request.role;

    const findRole = await this.db.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isRole.includes(findRole))
      throw new BadRequestException('Role invalide.');

    return true;
  }
}
