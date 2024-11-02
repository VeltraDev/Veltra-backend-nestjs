import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorMessages } from 'src/exception/error-messages.enum';

class AttachmentDto {
  @IsNotEmpty({ message: ErrorMessages.ATTACHMENT_URL_REQUIRED.message })
  @IsString({ message: ErrorMessages.ATTACHMENT_URL_STRING.message })
  url: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ATTACHMENT_TYPE_STRING.message })
  type?: string;
}

export class CreatePostDto {
  @IsNotEmpty({ message: ErrorMessages.POST_CONTENT_REQUIRED.message })
  @IsString({ message: ErrorMessages.POST_CONTENT_STRING.message })
  content: string;

  @IsOptional()
  @IsArray({ message: ErrorMessages.ATTACHMENTS_ARRAY.message })
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
