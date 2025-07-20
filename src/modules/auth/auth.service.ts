import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
import { CreateRegisterDto } from './dto/create.register.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RedisClientType } from 'redis';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private redis: RedisClientType,
    private readonly cacheService: CacheService,
  ) {}

  async googleCallback(user: any) {
    const findEmail = await this.db.prisma.user.findUnique({
      where: { email: user.email },
      include: { accounts: true },
    });

    if (!findEmail) {
      const userData = await this.db.prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
        },
      });

      await this.db.prisma.oAuthAccount.create({
        data: {
          provider: 'google',
          provider_id: user.sub,
          user_id: userData.id,
        },
      });

      const access_token = await this.jwtService.signAsync({
        userId: userData.id,
        role: userData.role,
      });

      const refresh_token = await this.jwtService.signAsync(
        {
          userId: userData.id,
          role: userData.role,
        },
        { expiresIn: '30d' },
      );

      const users = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      };

      return { access_token, refresh_token, users };
    }

    const findAccount = findEmail?.accounts.find(
      (account) => account.provider === 'google',
    );

    if (!findAccount) {
      await this.db.prisma.oAuthAccount.create({
        data: {
          provider: 'google',
          provider_id: user.sub,
          user_id: findEmail.id,
        },
      });
    }

    const access_token = await this.jwtService.signAsync({
      userId: findEmail.id,
      role: findEmail.role,
    });

    const refresh_token = await this.jwtService.signAsync(
      {
        userId: findEmail.id,
        role: findEmail.role,
      },
      { expiresIn: '30d' },
    );

    const users = {
      id: findEmail.id,
      email: findEmail.email,
      name: findEmail.name,
      role: findEmail.role,
    };

    return { access_token, refresh_token, users };
  }

  async githubOAuthCallback(user: any) {
    const [{ value: email }] = user.emails;

    const findEmail = await this.db.prisma.user.findUnique({
      where: { email: email },
      include: { accounts: true },
    });

    if (!findEmail) {
      const userData = await this.db.prisma.user.create({
        data: {
          email: email,
          name: user._json.name,
        },
      });

      await this.db.prisma.oAuthAccount.create({
        data: {
          provider: 'github',
          provider_id: user.id,
          user_id: userData.id,
        },
      });

      const access_token = await this.jwtService.signAsync({
        userId: userData.id,
        role: userData.role,
      });

      const refresh_token = await this.jwtService.signAsync(
        {
          userId: userData.id,
          role: userData.role,
        },
        { expiresIn: '30d' },
      );

      const users = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      };

      return { access_token, refresh_token, users };
    }

    const findAccount = findEmail?.accounts.find(
      (account) => account.provider === 'github',
    );

    if (!findAccount) {
      await this.db.prisma.oAuthAccount.create({
        data: {
          provider: 'github',
          provider_id: user.id,
          user_id: findEmail.id,
        },
      });
    }

    const access_token = await this.jwtService.signAsync({
      userId: findEmail.id,
      role: findEmail.role,
    });

    const refresh_token = await this.jwtService.signAsync(
      {
        userId: findEmail.id,
        role: findEmail.role,
      },
      { expiresIn: '30d' },
    );

    const users = {
      id: findEmail.id,
      email: findEmail.email,
      name: findEmail.name,
      role: findEmail.role,
    };

    return { access_token, refresh_token, users };
  }

  async register(createRegisterDto: CreateRegisterDto) {
    const findEmail = await this.db.prisma.user.findUnique({
      where: { email: createRegisterDto.email },
    });

    if (findEmail)
      throw new ConflictException('This email has already been registered.');

    const hashPassword = await bcrypt.hash(createRegisterDto.password, 12);

    const user = await this.db.prisma.user.create({
      data: {
        email: createRegisterDto.email,
        password: hashPassword,
        name: createRegisterDto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const access_token = await this.jwtService.signAsync({
      userId: user.id,
      role: user.role,
    });

    const refresh_token = await this.jwtService.signAsync(
      {
        userId: user.id,
        role: user.role,
      },
      { expiresIn: '30d' },
    );

    return { access_token, refresh_token, user };
  }

  async login(loginDto: LoginDto) {
    const findEmail = await this.db.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (
      !findEmail ||
      !(await bcrypt.compare(loginDto.password, findEmail.password!))
    )
      throw new ConflictException('Email or password error');

    const access_token = await this.jwtService.signAsync({
      userId: findEmail.id,
      role: findEmail.role,
    });

    const refresh_token = await this.jwtService.signAsync({
      userId: findEmail.id,
      role: findEmail.role,
    });

    const user = {
      id: findEmail.id,
      email: findEmail.email,
      name: findEmail.name,
      role: findEmail.role,
    };

    return { access_token, refresh_token, user };
  }

  async profile(userId: string) {
    const cacheKey = `auth:me:${userId}`;

    const cached = await this.cacheService.get<any>(cacheKey);

    if (cached) return cached;

    const user = await this.db.prisma.user.findUnique({
      where: { id: userId },
      include: { userFile: true },
    });

    if (!user) throw new ConflictException('Reference not found.');

    const data = {
      ...user,
      password: '',
    };

    await this.cacheService.set(cacheKey, data, 60);

    console.log(data);

    return data;
  }

  async logout(token: string, expiresInSeconds: number, userId: string) {
    await this.redis.set(`bl:${token}`, '1', {
      EX: expiresInSeconds,
    });

    await this.cacheService.del(`auth:me:${userId}`);
  }
}
