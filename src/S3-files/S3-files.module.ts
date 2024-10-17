import { Module } from '@nestjs/common';
import { S3FilesService } from './S3-files.service';
import { S3FilesController } from './S3-files.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
    }),
  ],
  controllers: [S3FilesController],
  providers: [S3FilesService],
})
export class S3FilesModule {}
