import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategi } from './strategies/google.strategies';
import { GithubStrategi } from './strategies/github.strategies';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategi, GithubStrategi],
})
export class AuthModule {}
