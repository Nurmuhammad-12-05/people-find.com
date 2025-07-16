import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const functionHandler = context.getHandler();
    const classHandler = context.getClass();

    const isInterceptor = this.reflector.getAllAndOverride('isInterceptor', [
      functionHandler,
      classHandler,
    ]);

    const statusCode = response.statusCode;
    const message = response.message;

    if (!isInterceptor) {
      return next.handle().pipe(
        map((data) => {
          return {
            status: statusCode,
            success: true,
            message: message,
            ...(typeof data !== 'object' || Array.isArray(data)
              ? { data }
              : data),
          };
        }),
      );
    }

    return next.handle();
  }
}
