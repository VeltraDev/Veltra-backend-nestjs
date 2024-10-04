import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

   // Serve static files
   app.useStaticAssets(join(__dirname, '..', 'public'));

   const configService = app.get(ConfigService);
   await app.listen(configService.get('PORT'));
}
bootstrap();
