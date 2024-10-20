import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/request/register-user.dto';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { getHashPassword, isValidPassword } from '../common/utils/hashPassword';
import { VerifyEmailDto } from './dto/request/verify-email.dto';
import { Response } from 'express';
import { UserResponseDto } from 'src/users/dto/response/user-response.dto';
import { AuthenticationResponse } from './dto/response/authentication-response.dto';
import { UsersInterface } from 'src/users/users.interface';
import { ForgotPasswordDto } from './dto/request/forgot-password.dto';
import { ResetPasswordDto } from './dto/request/reset-password.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { RolesService } from 'src/roles/roles.service';
import { USER_ROLE } from 'src/database/sample';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private roleService: RolesService,
    private configService: ConfigService,
  ) {}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    const user: User = await this.usersService.findOneByEmail(email);
    return this.mailService.sendForgotPasswordEmail(user);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;
    if (newPassword !== confirmPassword)
      throw new BadRequestException(ErrorMessages.CONFIRM_PASSWORD_MATCH);

    const user: User = await this.validateTokenAndGetUser(token);
    user.password = getHashPassword(newPassword);
    this.usersService.update(user.id, user);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto, response: Response) {
    const { token } = verifyEmailDto;

    const user: User = await this.validateTokenAndGetUser(token);

    if (user.isVerified)
      throw new BadRequestException(ErrorMessages.IS_VERIFIED);

    user.isVerified = true;
    await this.usersService.update(user.id, { isVerified: true });

    return await this.createAuthResponse(user, response);
  }

  async validateTokenAndGetUser(token: string): Promise<User> {
    if (!token) throw new BadRequestException(ErrorMessages.TOKEN_REQUIRED);

    let decodedToken: any;

    try {
      decodedToken = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(ErrorMessages.TOKEN_EXPIRED);
      } else {
        throw new UnauthorizedException(ErrorMessages.TOKEN_INVALID);
      }
    }

    const user: User = await this.usersService.getUserById(decodedToken.sub);
    return user;
  }

  async register(registerDto: RegisterUserDto): Promise<void> {
    const newUser = plainToClass(User, registerDto);

    newUser.password = getHashPassword(registerDto.password);
    newUser.role = await this.roleService.getRoleByName(USER_ROLE);

    const savedUser = await this.usersService.create(newUser);

    return this.mailService.sendVerifyEmail(savedUser);
  }

  async resendVerifyEmail(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);

    if (user.isVerified)
      throw new BadRequestException(ErrorMessages.IS_VERIFIED);

    await this.mailService.sendVerifyEmail(user);
  }

  private async createAuthResponse(
    currentUser: UsersInterface,
    response: Response,
  ) {
    // Before login, check user is verified account
    const checkUserVerified = await this.usersService.getUserById(
      currentUser.id,
    );
    if (!checkUserVerified.isVerified)
      throw new UnauthorizedException(ErrorMessages.NOT_VERIFIED_ACCOUNT);

    // Add information about current user login to response
    const authResponse = new AuthenticationResponse();
    authResponse.user = plainToInstance(UserResponseDto, currentUser, {
      excludeExtraneousValues: true,
    });

    // Create access token
    const { id, email, firstName, lastName, role } = currentUser;
    const payload: UsersInterface = {
      id,
      email,
      firstName,
      lastName,
      role: { id: role.id, name: role.name },
    };

    const accessToken = await this.jwtService.sign(payload);
    authResponse.access_token = accessToken;

    // Create refresh token
    const refreshToken = await this.createRefreshToken(payload);
    await this.usersService.updateUserRefreshToken(
      refreshToken,
      currentUser.email,
    );

    // Set refresh token into cookies
    response.clearCookie('refreshToken');
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')),
    });

    return authResponse;
  }

  async login(currentUser: UsersInterface, response: Response) {
    return await this.createAuthResponse(currentUser, response);
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user: User = await this.usersService.findOneByEmail(username);
    if (user) {
      const isValid = await isValidPassword(pass, user.password);
      if (isValid) return user;
    }
    return null;
  }

  private async createRefreshToken(payload: UsersInterface): Promise<string> {
    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')) / 1000,
    });
    return refreshToken;
  }

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      const decodedToken = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findUserByIdAndRefreshToken(
        decodedToken.id,
        refreshToken,
      );

      return await this.createAuthResponse(user, response);
    } catch (error) {
      throw new BadRequestException(ErrorMessages.REFRESH_TOKEN_INVALID);
    }
  };

  logout = async (user: UsersInterface, response: Response) => {
    await this.usersService.updateUserRefreshToken(null, user.email);
    response.clearCookie('refreshToken');
  };
}
