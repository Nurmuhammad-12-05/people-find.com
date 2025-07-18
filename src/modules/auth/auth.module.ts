import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategi } from './strategies/google.strategies';
import { GithubStrategi } from './strategies/github.strategies';
import { LinkedinStrategy } from './strategies/linkedin.strategies';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategi, GithubStrategi, LinkedinStrategy],
})
export class AuthModule {}
