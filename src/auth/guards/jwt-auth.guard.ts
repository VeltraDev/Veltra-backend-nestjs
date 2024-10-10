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

    if (err || !user)
      throw (
        err ||
        new UnauthorizedException(ErrorMessages.TOKEN_INVALID_OR_NO_TOKEN)
      );

    // Authorization (check permissions)
    const targetMethod = request.method;
    const targetEndpoint = request.route.path;

    const permissions = user?.permissions ?? [];
    const isExist = permissions.find(
      (permission) =>
        targetMethod === permission.method &&
        targetEndpoint === permission.apiPath,
    );

    if (!isExist)
      throw new ForbiddenException(ErrorMessages.NO_ACCESS_ENDPOINT);

    return user;
  }
}
