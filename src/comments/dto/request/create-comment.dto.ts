import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreateCommentDto {
  @IsNotEmpty({ message: ErrorMessages.COMMENT_CONTENT_REQUIRED.message })
  content: string;

  @IsOptional()
  @IsUUID('4', { message: ErrorMessages.PARENT_INVALID_UUID.message })
  parentId?: string;
}
