import { Catch, ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { DatabaseService } from 'src/core/database/database.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private db: DatabaseService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.status || 500;
    const message = exception.message || 'Internal Server Error';

    try {
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
    } catch (logError) {
      this.logger.error(
        `Xatoni log bazaga yozishda muammo: ${logError.message}`,
        logError.stack,
      );
    }

    if (response.headersSent) {
      this.logger.warn(
        `Response allaqachon yuborilgan: ${request.method} ${request.url}`,
      );
      return;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });

    this.logger.error(
      `Xatolik: ${message}`,
      exception.stack,
      `${request.method} ${request.url}`,
    );
  }
}
