import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response, Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { MessageResponse } from '../common/decorators/message_response.decorator';
import { UsersInterface } from '../users/users.interface';
import { User } from '../common/decorators/user.decorator';
import { RegisterUserDto } from './dto/request/register-user.dto';
import { VerifyEmailDto } from './dto/request/verify-email.dto';
import { ResendEmailDto } from './dto/request/resend-email.dto';
import { ForgotPasswordDto } from './dto/request/forgot-password.dto';
import { ResetPasswordDto } from './dto/request/reset-password.dto';

@ApiTags('Module Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @MessageResponse('Kiểm tra email để xác thực tài khoản của bạn')
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @Public()
  @MessageResponse('Tài khoản của bạn đã được xác thực thành công')
  @Post('verify-email')
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.verifyEmail(verifyEmailDto, response);
  }

  @Public()
  @MessageResponse('Kiểm tra email để xác thực tài khoản của bạn')
  @Post('resend-verify')
  async resendVerifyEmail(@Body() resendEmailDto: ResendEmailDto) {
    const { email } = resendEmailDto;
    await this.authService.resendVerifyEmail(email);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @MessageResponse('Người dùng đã đăng nhập thành công')
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return await this.authService.login(req.user, response);
  }

  @MessageResponse('Lấy thông tin người dùng đã đăng nhập')
  @Get('account')
  async getAccount(@User() user: UsersInterface) {
    return await { user };
  }

  @MessageResponse('Đăng xuất người dùng khỏi tài khoản thành công')
  @Post('logout')
  async logout(
    @User() user: UsersInterface,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.logout(user, response);
  }

  @Public()
  @MessageResponse('Lấy bộ refresh token và access token mới')
  @Get('refresh')
  async getNewToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_Token = request.cookies['refreshToken'];
    return await this.authService.processNewToken(refresh_Token, response);
  }

  @Public()
  @MessageResponse('Kiểm tra email để xác thực tài khoản của bạn')
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @MessageResponse('Tài khoản của bạn đã đổi mật khẩu thành công')
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
