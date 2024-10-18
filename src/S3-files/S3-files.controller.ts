import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { S3FilesService } from './S3-files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';


@Controller('files')
export class S3FilesController {
  constructor(private readonly S3FilesService: S3FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('fileUpload'))
  @MessageResponse('Tải lên một tệp tin')
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /^(html|text\/html|png|image\/png|svg|image\/svg+xml|jpg|jpeg|image\/jpeg|webp|image\/webp|bmp|image\/bmp|avif|image\/avif)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const url = await this.S3FilesService.upload(
      file.originalname,
      file.buffer,
    );
    return { url };
  }
}
