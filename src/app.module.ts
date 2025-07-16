import { DynamicModule, Logger, Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { SearchModule } from './modules/search/search.module';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { AiModule } from './modules/ai/ai.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { AppController } from './app.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './common/guard/auth.guard';
import { BlacklistGuard } from './common/guard/blacklist.guard';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    SearchModule,
    UserModule,
    ChatModule,
    AiModule,
    ProfileModule,
    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       ttl: 60000,
    //       limit: 5,
    //     },
    //   ],
    // }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BlacklistGuard,
    },

    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
