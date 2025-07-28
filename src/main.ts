import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseService } from './core/database/database.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import passport from 'passport';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(passport.initialize());

  const dbService = app.get(DatabaseService);

  app.useGlobalFilters(new GlobalExceptionFilter(dbService));

  const config = new DocumentBuilder()
    .setTitle('API hujjatlari')
    .setDescription('Sizning NestJS loyihangiz uchun Swagger hujjatlari')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders: '*',
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
