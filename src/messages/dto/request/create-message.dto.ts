import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  IsString,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreateMessageDto {
  @IsNotEmpty({ message: ErrorMessages.MESSAGE_CONTENT_REQUIRED })
  @IsString({ message: ErrorMessages.MESSAGE_CONTENT_STRING })
  content: string;

  @IsUUID('4', { message: ErrorMessages.MESSAGE_CONVERSATION_UUID })
  @IsNotEmpty({ message: ErrorMessages.MESSAGE_CONVERSATION_REQUIRED })
  conversationId: string;

  @IsUUID('4', { message: ErrorMessages.MESSAGE_SENDER_UUID })
  @IsNotEmpty({ message: ErrorMessages.MESSAGE_SENDER_REQUIRED })
  senderId: string;

  @IsArray({ message: ErrorMessages.MESSAGE_FILES_ARRAY })
  @IsOptional()
  files?: { url: string; type?: string }[];
}
