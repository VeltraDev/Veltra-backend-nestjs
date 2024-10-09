import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersInterface } from 'src/users/users.interface';
import { ErrorMessages } from 'src/exception/error-messages.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const user: UsersInterface = await this.authService.validateUser(
      username,
      password,
    );
    if (!user)
      throw new UnauthorizedException(ErrorMessages.EMAIL_OR_PASSWORD_INVALID);
    return user;
  }
}
