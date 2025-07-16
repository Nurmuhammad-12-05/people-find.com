import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { DatabaseService } from 'src/core/database/database.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private db: DatabaseService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.status || 500;
    const message = exception.message || 'Internal Server Error';

    await this.db.prisma.errorLog.create({
      data: {
        message: message,
        stackTrace: exception.stack,
        context: {
          path: request.url,
          method: request.method,
          body: request.body,
        },
      },
    });

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
