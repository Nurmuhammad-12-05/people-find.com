import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateRegisterDto } from './dto/create.register.dto';
import { LoginDto } from './dto/login.dto';
import { RedisRateLimitService } from 'src/core/database/redis.service';
import { Request } from 'express';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisRateLimitService: RedisRateLimitService,
  ) {}

  @Get('google')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Google orqali autentifikatsiya (redirect)' })
  @ApiResponse({ status: 200, description: 'Google redirect linki' })
  @UseGuards(AuthGuard('google'))
  googleOAuthRedirect() {}

  @Get('google/callback')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Google token qaytardi' })
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request) {
    const user = req['user'];
    return await this.authService.googleCallback(user);
  }

  @Get('github')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'GitHub orqali autentifikatsiya (redirect)' })
  @ApiResponse({ status: 200, description: 'GitHub redirect linki' })
  @UseGuards(AuthGuard('github'))
  githubleOAuthRedirect() {}

  @Get('github/callback')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 200, description: 'GitHub token qaytardi' })
  @UseGuards(AuthGuard('github'))
  async githubOAuthCallback(@Req() req: Request) {
    const user = req['user'];
    return await this.authService.githubOAuthCallback(user);
  }

  @Get('linkedin')
  @SetMetadata('isPublic', true)
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuth() {}

  @Get('linkedin/callback')
  @SetMetadata('isPublic', true)
  @UseGuards(AuthGuard('linkedin'))
  async linkedinCallback(@Req() req: Request) {
    return {
      message: 'Login success',
      user: req.user,
    };
  }
  @Post('register')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Foydalanuvchini ro‘yxatdan o‘tkazish' })
  @ApiResponse({ status: 201, description: 'Muvaffaqiyatli ro‘yxatdan o‘tdi' })
  @ApiResponse({ status: 400, description: 'Notog‘ri ma’lumot' })
  async register(@Body() createRegisterDto: CreateRegisterDto) {
    const { access_token, refresh_token, user } =
      await this.authService.register(createRegisterDto);

    return { access_token, refresh_token, user };
  }

  @Post('login')
  @SetMetadata('isPublic', true)
  @ApiOperation({ summary: 'Foydalanuvchini tizimga kiritish (login)' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli tizimga kirdi' })
  @ApiResponse({ status: 429, description: 'Limitdan oshib ketdi' })
  @ApiResponse({ status: 400, description: 'Login ma’lumotlari noto‘g‘ri' })
  async login(@Body() loginDto: LoginDto) {
    const rateLimitKey = `login:${loginDto.email}`;
    await this.redisRateLimitService.checkLimit(rateLimitKey, 5, 60);

    const { access_token, refresh_token, user } =
      await this.authService.login(loginDto);

    return { access_token, refresh_token, user };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchi profilini olish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi ma’lumotlari' })
  @ApiResponse({ status: 401, description: 'Token mavjud emas yoki yaroqsiz' })
  async profile(@Req() req: Request) {
    const userId = req['userId'];
    const data = await this.authService.profile(userId);
    return { data };
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Foydalanuvchini tizimdan chiqarish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli chiqdi' })
  @ApiResponse({ status: 401, description: 'Token topilmadi' })
  logout(@Req() req: Request) {
    const token = req.headers.authorization!.split(' ')[1];
    const expiresIn = 3600;
    const userId = req['userId'];
    this.authService.logout(token, expiresIn, userId);
    return { message: 'Logged out successfully' };
  }
}
