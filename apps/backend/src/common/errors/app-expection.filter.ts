import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from './app-exception';

@Catch(HttpException)
export class AppHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception.getResponse?.();

    // Default Nest shape
    let message: string | string[] | undefined;
    let code: string | undefined;

    if (exception instanceof AppException) {
      // Our error
      code = exception.code;
      if (typeof body === 'object' && body && 'message' in body) {
        message = (body as any).message;
      } else {
        message = exception.message;
      }
    } else {
      // Standard Nest errors
      if (typeof body === 'string') message = body;
      else if (typeof body === 'object' && body) {
        message = (body as any).message ?? exception.message;
      }
    }

    res.status(status).json({
      statusCode: status,
      code,
      message,
    });
  }
}
