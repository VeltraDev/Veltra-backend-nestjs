import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersInterface } from 'src/users/users.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const user: UsersInterface = await this.authService.validateUser(username, password);
    if (!user)
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không hợp lệ. Hãy thử lại!',
      );
    return user;
  }
}
