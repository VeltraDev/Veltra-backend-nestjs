import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
import { INestApplicationContext } from '@nestjs/common';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class AuthenticatedSocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly jwtService: JwtService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.use((socket, next) => {
      const authHeader = socket.handshake.headers.authorization;
      if (!authHeader) {
        return next(new Error(ErrorMessages.TOKEN_REQUIRED.message));
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return next(new Error(ErrorMessages.TOKEN_REQUIRED.message));
      }

      try {
        const user = this.jwtService.verify(token);
        socket.user = user;
        next();
      } catch (err) {
        return next(new Error(ErrorMessages.TOKEN_INVALID_OR_NO_TOKEN.message));
      }
    });
    return server;
  }
}
