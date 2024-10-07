import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from './handlebars.adapter';
import { JwtModule } from '@nestjs/jwt';
import ms from 'ms';

@Module(
  {
    imports: [
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          signOptions: {
            expiresIn: ms(configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE')),
          },
        }),
        inject: [ConfigService],
      }),
    ],
  providers: [MailService, ConfigService],
  exports: [MailService],
})
export class MailModule {}
