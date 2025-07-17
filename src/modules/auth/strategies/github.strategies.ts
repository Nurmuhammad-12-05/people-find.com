import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategi extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID:
        (process.env.CLIENT_ID_GITHUB_DEV as string) ||
        (process.env.CLIENT_ID_GITHUB_PROD as string),
      clientSecret:
        (process.env.CLIENT_SECRET_GITHUB_DEV as string) ||
        (process.env.CLIENT_SECRET_GITHUB_PROD as string),
      callbackURL:
        (process.env.CLIENT_COLLBACK_URL_GITHUB_DEV as string) ||
        (process.env.CLIENT_COLLBACK_URL_GITHUB_PROD as string),
      scope: ['user:email', 'profile'],
    });
  }

  validate(
    access_token: string,
    refreshToken: string,
    profile: any,
    variyfyCollback: any,
  ): void {
    variyfyCollback(null, profile);
  }
}
