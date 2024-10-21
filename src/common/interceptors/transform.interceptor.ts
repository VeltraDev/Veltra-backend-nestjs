import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IS_MESSAGE_RESPONSE } from '../decorators/message-response.decorator';

export interface Response<T> {
  statusCode: number;
  code: number;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {

    return next.handle().pipe(
      map((data) => ({
        code: 1000,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message:
          this.reflector.get<string>(
            IS_MESSAGE_RESPONSE,
            context.getHandler(),
          ) || '',
        data: data,
      })),
    );
  }
}
