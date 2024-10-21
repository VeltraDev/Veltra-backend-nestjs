import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorMessages } from './error-messages.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any).message
        : ErrorMessages.INTERNAL_SERVER_ERROR.message;

    const code =
      this.getCodeFromMessage(message) ||
      ErrorMessages.INTERNAL_SERVER_ERROR.code;

    response.status(status).json({
      code: code,
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getCodeFromMessage(message: string): number | null {
    for (const key in ErrorMessages) {
      if (ErrorMessages[key].message === message) {
        return ErrorMessages[key].code;
      }
    }
    return null;
  }
}
