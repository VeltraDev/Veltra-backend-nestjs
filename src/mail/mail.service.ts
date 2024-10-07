import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private jwtSecret: string;
  private appUrl: string;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    this.appUrl = this.configService.get<string>('APP_URL');
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_AUTH_USER'),
        pass: this.configService.get<string>('EMAIL_AUTH_PASSWORD'),
      },
    });
  }

  private async sendMail(
    to: string,
    subject: string,
    templateName: string,
    templateData: any,
  ) {
    try {
      const templatePath = join(__dirname, 'templates', `${templateName}.hbs`);
      const templateFile = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateFile);
      const html = compiledTemplate(templateData);

      await this.transporter.sendMail({
        to,
        from: `"${this.configService.get<string>(
          'EMAIL_FROM_NAME',
        )}" <${this.configService.get<string>('EMAIL_FROM_ADDRESS')}>`,
        subject,
        html,
      });
    } catch (error) {
      throw new InternalServerErrorException('Gửi email thất bại.');
    }
  }

  private generateEmailToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE'),
    });
  }

  public async sendEmailWithTemplate(
    user: User,
    subject: string,
    templateName: string,
    linkType: 'verify' | 'reset',
  ): Promise<void> {
    const token = this.generateEmailToken(user);
    const templateData = {
      name: `${user.firstName} ${user.lastName}`,
      [`${linkType}Url`]: `${this.appUrl}/verify-email?token=${token}`,
    };

    await this.sendMail(user.email, subject, templateName, templateData);
  }

  public async sendVerifyEmail(user: User): Promise<void> {
    await this.sendEmailWithTemplate(
      user,
      'Xác thực tài khoản',
      'verify-email',
      'verify',
    );
  }

  public async sendForgotPasswordEmail(user: User): Promise<void> {
    await this.sendEmailWithTemplate(
      user,
      'Yêu cầu đặt lại mật khẩu',
      'forgot-password',
      'reset',
    );
  }
}
