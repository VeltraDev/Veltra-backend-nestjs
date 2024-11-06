import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  IsString,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreateMessageDto {
  @IsOptional()
  @IsString({ message: ErrorMessages.MESSAGE_CONTENT_STRING.message })
  content: string;

  @IsUUID('4', { message: ErrorMessages.MESSAGE_CONVERSATION_UUID.message })
  @IsNotEmpty({ message: ErrorMessages.MESSAGE_CONVERSATION_REQUIRED.message })
  conversationId: string;

  @IsArray({ message: ErrorMessages.MESSAGE_FILES_ARRAY.message })
  @IsOptional()
  files?: { url: string; type?: string }[];
}
