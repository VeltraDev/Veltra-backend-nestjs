import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

export class AuthenticatedSocketIoAdapter extends IoAdapter {
  constructor(
    app: any,
    private readonly jwtService: JwtService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.use((socket, next) => {
      const token = socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new UnauthorizedException('JWT token is required'));
      }
      try {
        const user = this.jwtService.verify(token);
        socket.user = user;
        next();
      } catch (err) {
        next(new UnauthorizedException('Invalid JWT token'));
      }
    });
    return server;
  }
}
