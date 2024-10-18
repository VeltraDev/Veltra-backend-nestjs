import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './exception/global-exception.filter';
import { WsExceptionFilter } from './exception/ws-exception.filter';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedSocketIoAdapter } from './chats/secure/authenticated-socketio.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Access variables in .env
  const configService = app.get(ConfigService);

  // Validate and chain errors in DTO (default 400 error, format response by NestJS)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Exception Filter (errors in service file)
  app.useGlobalFilters(new GlobalExceptionFilter());
  // app.useGlobalFilters(new WsExceptionFilter());

  // Config versioning for APIs
  app.setGlobalPrefix('api'); // api/v1/route
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  // Config CORS
  app.enableCors({
    origin: ['*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Config cookies
  app.use(cookieParser());

  // Set global JwtAuthGuard to project all endpoints
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector)); // response when success (status code 200)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Custom adapter for socket.io
  const jwtService = app.get(JwtService);
  app.useWebSocketAdapter(new AuthenticatedSocketIoAdapter(app, jwtService));

  // Config helmet to enhance security
  // app.use(helmet());

  // Config swagger to read APIs document in browser
  // const config = new DocumentBuilder()
  //   .setTitle('Toyota APIs Documents')
  //   .setDescription('All modules, created by thuanflu!')
  //   .setVersion('1.0')
  //   .addBearerAuth(
  //     {
  //       type: 'http',
  //       scheme: 'Bearer',
  //       bearerFormat: 'JWT',
  //       in: 'header',
  //     },
  //     'token',
  //   )
  //   .addSecurityRequirements('token')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('swagger', app, document, {
  //   swaggerOptions: {
  //     persistAuthorization: true,
  //   },
  // });

  await app.listen(configService.get('PORT') || 8080);
}
bootstrap();
