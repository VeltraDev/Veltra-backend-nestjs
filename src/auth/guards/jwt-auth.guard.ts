import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (info) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          message: ErrorMessages.TOKEN_EXPIRED.message,
        });
      }

      switch (info.name) {
        case 'JsonWebTokenError':
          throw new UnauthorizedException({
            message: ErrorMessages.TOKEN_INVALID.message,
          });
        case 'TokenExpiredError':
          throw new UnauthorizedException({
            message: ErrorMessages.TOKEN_EXPIRED.message,
          });
        default:
          throw new UnauthorizedException({
            message: ErrorMessages.TOKEN_INVALID.message,
          });
      }
    }

    if (err || !user) {
      throw new UnauthorizedException({
        message: ErrorMessages.TOKEN_INVALID.message,
      });
    }

    // Authorization (check permissions)
    const targetMethod = request.method;
    const targetEndpoint = request.route.path;

    const permissions = user?.role?.permissions ?? [];
    const isExist = permissions.find(
      (permission) =>
        targetMethod === permission.method &&
        targetEndpoint === permission.apiPath,
    );

    if (!isExist)
      throw new ForbiddenException(ErrorMessages.NO_ACCESS_ENDPOINT.message);

    return user;
  }
}
