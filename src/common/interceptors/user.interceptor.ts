import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      map((data) => {
        if (user) {
          if (request.method === 'POST') {
            data.createdBy = { id: user.id, email: user.email };
          } else if (request.method === 'PUT' || request.method === 'PATCH') {
            data.updatedBy = { id: user.id, email: user.email };
          }
        }
        return data;
      }),
    );
  }
}
